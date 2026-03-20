import numpy as np
import pandas as pd
import plotly.graph_objects as go
from ipywidgets import interact, Dropdown
from scipy.signal import butter, filtfilt, find_peaks
from scipy.interpolate import CubicSpline
import os

# Defina o número do sujeito
sujeito = 30

# Monta o nome do arquivo do celular com base no número do sujeito
base_dir = r"C:\Users\Matheus Beck\Desktop\UFPR\Rodacki"
nome_cel = f"S{sujeito:02d}_sl(sl).csv"
caminho_cel = os.path.join(base_dir, "Testes TCC", "Sensor LOG", nome_cel)

# Leitura dos dados do celular
# Novo formato: headers = timestamp,acc_x,acc_y,acc_z,gyro_x,gyro_y,gyro_z
# A linha 1 (índice 0) é o header; a linha 2 está em branco — skiprows=[1] pula só ela.
dados_cel = pd.read_csv(caminho_cel, skiprows=[1])

fs = 60  # Hz

# --- Dados do celular ---
# Novo formato: timestamp é string "HH:MM:SS.mmmZ" — convertemos para segundos relativos ao início
def timestamp_to_seconds(ts_series):
    """Converte coluna de strings 'HH:MM:SS.mmmZ' em segundos relativos ao primeiro sample."""
    def parse(s):
        s = s.rstrip('Z')
        h, m, rest = s.split(':')
        return int(h) * 3600 + int(m) * 60 + float(rest)
    seconds = ts_series.apply(parse).values
    return seconds - seconds[0]

tempo_cel = timestamp_to_seconds(dados_cel['timestamp'])

# Aceleração e giroscópio
# Novo formato: acc já em m/s² (não em G), gyro em rad/s
acc = dados_cel[['acc_x', 'acc_y', 'acc_z']].to_numpy()
gyr = dados_cel[['gyro_x', 'gyro_y', 'gyro_z']].to_numpy

# ========================================
# Interpolação dos dados do celular (acc e gyr)
# ========================================

dt = 1 / fs

# --- Aceleração ---
# Novo formato: timestamp único para acc e gyro (coluna 'timestamp')
# Reordenamento de eixos preservado: X, Z, Y — com inversão de Y (igual ao original)
Time_acc = tempo_cel.copy()
Signal_acc = dados_cel[["acc_x", "acc_z", "acc_y"]].values  # acc já em m/s², sem multiplicar por 9.81
Signal_acc[:, 2] *= -1

Time_diff_acc = np.diff(Time_acc)
Time_diff_acc = np.insert(Time_diff_acc, 0, 0)
Time_cumsum_acc = np.cumsum(Time_diff_acc)
if not np.all(np.diff(Time_cumsum_acc) > 0):
    unique_indices = np.unique(Time_cumsum_acc, return_index=True)[1]
    Time_cumsum_acc = Time_cumsum_acc[unique_indices]
    Signal_acc = Signal_acc[unique_indices]
    sorted_indices = np.argsort(Time_cumsum_acc)
    Time_cumsum_acc = Time_cumsum_acc[sorted_indices]
    Signal_acc = Signal_acc[sorted_indices]

New_Time_acc = np.arange(Time_cumsum_acc.min(), Time_cumsum_acc.max(), dt)
Signal_acc_interp = np.zeros((len(New_Time_acc), 3))
for i in range(3):
    cs = CubicSpline(Time_cumsum_acc, Signal_acc[:, i])
    Signal_acc_interp[:, i] = cs(New_Time_acc)

# --- Giroscópio ---
# Novo formato: mesmo timestamp do acc — reordenamento de eixos preservado: X, Z, Y
Time_gyr = tempo_cel.copy()
Signal_gyr = dados_cel[["gyro_x", "gyro_z", "gyro_y"]].values
Signal_gyr[:, 2] *= -1

Time_diff_gyr = np.diff(Time_gyr)
Time_diff_gyr = np.insert(Time_diff_gyr, 0, 0)
Time_cumsum_gyr = np.cumsum(Time_diff_gyr)

if not np.all(np.diff(Time_cumsum_gyr) > 0):
    unique_indices = np.unique(Time_cumsum_gyr, return_index=True)[1]
    Time_cumsum_gyr = Time_cumsum_gyr[unique_indices]
    Signal_gyr = Signal_gyr[unique_indices]
    sorted_indices = np.argsort(Time_cumsum_gyr)
    Time_cumsum_gyr = Time_cumsum_gyr[sorted_indices]
    Signal_gyr = Signal_gyr[sorted_indices]

New_Time_gyr = np.arange(Time_cumsum_gyr.min(), Time_cumsum_gyr.max(), dt)
Signal_gyr_interp = np.zeros((len(New_Time_gyr), 3))
for i in range(3):
    cs = CubicSpline(Time_cumsum_gyr, Signal_gyr[:, i])
    Signal_gyr_interp[:, i] = cs(New_Time_gyr)

# --- Filtro Butterworth e plot comparativo para ACC e GYR (dados já interpolados) ---

# Parâmetros do filtro
order = 4
cutoff = 1.3  # Hz
nyq = 0.5 * fs
normal_cutoff = cutoff / nyq
b, a = butter(order, normal_cutoff, btype='low', analog=False)

# Filtrar aceleração do CELULAR
Signal_acc_filt = np.zeros_like(Signal_acc_interp)
for i in range(3):
    Signal_acc_filt[:, i] = filtfilt(b, a, Signal_acc_interp[:, i])

cutoff = 10  # Hz
normal_cutoff = cutoff / nyq
b, a = butter(order, normal_cutoff, btype='low', analog=False)

# Filtrar giroscópio do CELULAR
Signal_gyr_filt = np.zeros_like(Signal_gyr_interp)
for i in range(3):
    Signal_gyr_filt[:, i] = filtfilt(b, a, Signal_gyr_interp[:, i])

# ================================================================================
#  Confirmação e ajuste do tamanho dos dados de acc e gyro do celular
# ================================================================================

# Verifica se os sinais interpolados têm o mesmo tamanho
if Signal_acc_filt.shape[0] != Signal_gyr_filt.shape[0]:
    print(f"ATENÇÃO: acc ({Signal_acc_filt.shape[0]}) e gyro ({Signal_gyr_filt.shape[0]}) têm tamanhos diferentes.")
    min_len = min(Signal_acc_filt.shape[0], Signal_gyr_filt.shape[0])
    Signal_acc_filt = Signal_acc_filt[:min_len]
    Signal_gyr_filt = Signal_gyr_filt[:min_len]
    New_Time_acc = New_Time_acc[:min_len]
    print(f"Os sinais foram ajustados para o tamanho mínimo comum: {min_len}")
else:
    print("OK: acc e gyro têm o mesmo tamanho.")

# ================================================================================
#  Estimar orientação com filtro Madgwick (celular)
# ================================================================================
from ahrs.filters import Madgwick
comp = Madgwick(acc=Signal_acc_filt, gyr=Signal_gyr_filt, frequency=fs)
Q = comp.Q  # quaternions

# ================================================================================
# Transformar quaternions em ângulos em Graus
# ================================================================================
from ahrs.common.orientation import q2euler
quaternions = np.nan_to_num(Q)
valid = np.logical_not(np.all(quaternions == 0, axis=1))
quaternions_valid = quaternions[valid]
euler_angles = np.array([q2euler(q) for q in quaternions_valid])
deg_angles = np.degrees(euler_angles)
deg_angles[:, 0] = deg_angles[:, 0] - np.mean(deg_angles[:, 0])

######################################################################################
# --- Detecção de picos, vales, início e fim do movimento (SEM VALES FINAIS FANTASMAS) ---
######################################################################################
min_distance = 30  # frames (ajuste conforme necessário)

# Calcular a média dos valores do ângulo bruto (X)
media_angulo = np.mean(deg_angles[:, 0])

# Detectar picos (acima da média + 5)
limite_pico = media_angulo + 5
peaks, _ = find_peaks(deg_angles[:, 0], distance=min_distance)
peaks = [p for p in peaks if deg_angles[p, 0] > limite_pico]

# Detectar vales (abaixo da média - 5)
limite_vale = media_angulo - 5
vales, _ = find_peaks(-deg_angles[:, 0], distance=min_distance)
vales = [v for v in vales if deg_angles[v, 0] < limite_vale]
# Remover vales que estão no último índice do vetor
vales = [v for v in vales if v < len(deg_angles[:, 0]) - 1]

# --- Encontrar início do movimento (vale-pico-vale) ---
inicio_mov = 0
for i in range(len(vales) - 2):
    v1 = vales[i]
    for p in peaks:
        if v1 < p < vales[i + 1]:
            inicio_mov = v1
            print(f"Início do movimento em: {tempo_cel[inicio_mov]:.2f}s (Index:{inicio_mov})")
            break
    if inicio_mov != 0:
        break
if inicio_mov == 0:
    print("Padrão vale-pico-vale não encontrado, usando início padrão.")
    inicio_mov = 0

# Definir fim do movimento (30s após início)
tempo_inicio = tempo_cel[inicio_mov]
tempo_fim = tempo_inicio + 30.50
fim_mov = np.argmin(np.abs(tempo_cel - tempo_fim))
print(f"Fim do movimento em: {tempo_cel[fim_mov]:.2f}s (Index {fim_mov})")

# Filtrar picos e vales apenas dentro do intervalo do movimento
peaks_mov = [p for p in peaks if inicio_mov <= p <= fim_mov]
vales_mov = [v for v in vales if inicio_mov <= v <= fim_mov]

print(f"Picos no movimento: {len(peaks_mov)}")
print(f"Vales no movimento: {len(vales_mov)}")

# --- Encontrar vales entre picos (sem filtrar pelo valor da média), preservando o primeiro vale ---
vales_corrigido = [vales_mov[0]] if len(vales_mov) > 0 else []
for i in range(len(peaks_mov) - 1):
    start = peaks_mov[i]
    end = peaks_mov[i+1]
    # Garante que o slice não é vazio
    if end > start + 1:
        seq = deg_angles[start:end, 0]
        if len(seq) > 0:
            idx_min = np.argmin(seq) + start
            if idx_min != vales_corrigido[-1]:
                vales_corrigido.append(idx_min)
# Adicionar o último vale após o último pico, se existir e NÃO for o último índice e for mínimo local
if len(peaks_mov) > 0 and peaks_mov[-1] + 1 < len(deg_angles[:, 0]):
    seq = deg_angles[peaks_mov[-1]+1:fim_mov+1, 0]
    if len(seq) > 0:
        idx_min_final = np.argmin(seq) + peaks_mov[-1] + 1
        if (
            idx_min_final < len(deg_angles[:, 0]) - 1 and
            idx_min_final > 0 and
            deg_angles[idx_min_final, 0] < deg_angles[idx_min_final-1, 0] and
            deg_angles[idx_min_final, 0] < deg_angles[idx_min_final+1, 0]
        ):
            vales_corrigido.append(idx_min_final)
vales_mov = vales_corrigido

# Corte dos dados do celular
tempo_cel_corte = tempo_cel[inicio_mov:fim_mov+1]
angles_x_cel_corte = deg_angles[inicio_mov:fim_mov+1, 0]

# Se quiser centralizar o sinal do celular
angles_x_cel_corte = angles_x_cel_corte - np.mean(angles_x_cel_corte)

# Se quiser ajustar o tempo para começar do zero
t_cel_aligned = np.array(tempo_cel_corte) - tempo_cel_corte.iloc[0] if hasattr(tempo_cel_corte, 'iloc') else np.array(tempo_cel_corte) - tempo_cel_corte[0]
cel_aligned = angles_x_cel_corte

# ...existing code...
min_distance = 30  # frames (ajuste conforme necessário)

# Calcular a média dos valores do sinal ajustado
media_ajustado = np.mean(cel_aligned)

# Detectar picos (acima da média + 5)
limite_pico = media_ajustado + 5
peaks, _ = find_peaks(cel_aligned, distance=min_distance)
peaks = [p for p in peaks if cel_aligned[p] > limite_pico]

# Detectar vales (abaixo da média - 5)
limite_vale = media_ajustado - 5
vales, _ = find_peaks(-cel_aligned, distance=min_distance)
vales = [v for v in vales if cel_aligned[v] < limite_vale]

# --- Preservar o primeiro vale e o primeiro pico ---
if len(vales) == 0 or len(peaks) == 0:
    print("Nenhum vale ou pico detectado.")
else:
    if vales[0] > peaks[0]:
        # Se o primeiro pico vem antes do primeiro vale, adiciona o índice 0 como vale
        vales = [0] + vales
    if peaks[0] > vales[0]:
        # Se o primeiro vale vem antes do primeiro pico, nada a fazer
        pass
    else:
        # Se o primeiro pico vem antes, adiciona o índice 0 como pico
        peaks = [0] + peaks

# --- Encontrar vales entre picos (sem filtrar pelo valor da média), preservando o primeiro vale ---
vales_corrigido = [vales[0]] if len(vales) > 0 else []
for i in range(len(peaks) - 1):
    start = peaks[i]
    end = peaks[i+1]
    if end > start + 1:
        seq = cel_aligned[start:end]
        if len(seq) > 0:
            idx_min = np.argmin(seq) + start
            if idx_min != vales_corrigido[-1]:
                vales_corrigido.append(idx_min)
# Adicionar o último vale após o último pico, se existir e NÃO for o último índice e for mínimo local
if len(peaks) > 0 and peaks[-1] + 1 < len(cel_aligned):
    seq = cel_aligned[peaks[-1]+1:]
    if len(seq) > 0:
        idx_min_final = np.argmin(seq) + peaks[-1] + 1
        if (
            idx_min_final < len(cel_aligned) - 1 and
            idx_min_final > 0 and
            cel_aligned[idx_min_final] < cel_aligned[idx_min_final-1] and
            cel_aligned[idx_min_final] < cel_aligned[idx_min_final+1]
        ):
            vales_corrigido.append(idx_min_final)
vales = vales_corrigido

# --- Prints dos parâmetros do Celular (ajustado) ---
if len(vales) > 0 and len(peaks) > 0:
    print(f"Início do movimento em: {t_cel_aligned[vales[0]]:.2f}s (Index:{vales[0]})")
    print(f"Fim do movimento em: {t_cel_aligned[-1]:.2f}s (Index {len(t_cel_aligned)-1})")
else:
    print("Não foi possível determinar início/fim do movimento (Celular).")
print(f"Picos no movimento: {len(peaks)}")
print(f"Vales no movimento: {len(vales)}")
# ...existing code...

# --- Separar o movimento em ciclos: vale-pico-vale-pico-vale para o Celular (usando variáveis do seu bloco) ---
ciclos_celular = []
i_vale = 0
i_pico = 0

while True:
    # Encontrar 3 vales e 2 picos alternados (vale-pico-vale-pico-vale)
    if i_vale + 2 >= len(vales) or i_pico + 1 >= len(peaks):
        break
    v1 = vales[i_vale]
    # Procurar primeiro pico após v1
    while i_pico < len(peaks) and peaks[i_pico] < v1:
        i_pico += 1
    if i_pico >= len(peaks):
        break
    p1 = peaks[i_pico]
    # Procurar segundo vale após p1
    i_vale2 = i_vale + 1
    while i_vale2 < len(vales) and vales[i_vale2] < p1:
        i_vale2 += 1
    if i_vale2 >= len(vales):
        break
    v2 = vales[i_vale2]
    # Procurar segundo pico após v2
    i_pico2 = i_pico + 1
    while i_pico2 < len(peaks) and peaks[i_pico2] < v2:
        i_pico2 += 1
    if i_pico2 >= len(peaks):
        break
    p2 = peaks[i_pico2]
    # Procurar terceiro vale após p2
    i_vale3 = i_vale2 + 1
    while i_vale3 < len(vales) and vales[i_vale3] < p2:
        i_vale3 += 1
    if i_vale3 >= len(vales):
        break
    v3 = vales[i_vale3]
    # Salvar ciclo
    ciclos_celular.append({
        'vales': [v1, v2, v3],
        'picos': [p1, p2],
        'inicio': v1,
        'fim': v3
    })
    # Avançar para o próximo ciclo (começa no próximo vale após v3)
    i_vale = i_vale3
    i_pico = i_pico2

print(f"Total de ciclos Celular encontrados: {len(ciclos_celular)}")

##############################################################
# CALCULO DA VELOCIDADE POR SLOPE
##############################################################

def calc_vel_segmento(t, y, idx_ini, idx_fim):
    """
    Ajusta uma reta y = vel·t + b ao trecho compreendido entre
    idx_ini e idx_fim (inclusive).
    Retorna: vel, b, t_inicial, y_inicial, vetor_t, vetor_y
    """
    t_seg = t[idx_ini:idx_fim + 1]
    y_seg = y[idx_ini:idx_fim + 1]
    vel, b = np.polyfit(t_seg, y_seg, 1)        # inclinação e intercepto
    return vel, b, t_seg[0], y_seg[0], t_seg, y_seg

def get_idx_30pc(t, y, idx1, idx2):
    """
    Localiza os 30 % abaixo e 30 % acima do ponto médio (em y),
    devolvendo os índices que mais se aproximam desses dois níveis.
    """
    y1, y2 = y[idx1], y[idx2]
    y_med   = (y1 + y2) / 2
    delta_y = 0.3 * abs(y2 - y1)               # 30 %
    y_menos = y_med - delta_y                  # −30 %
    y_mais  = y_med + delta_y                  # +30 %

    idx_range = np.arange(min(idx1, idx2), max(idx1, idx2) + 1)
    idx_v1 = idx_range[np.argmin(np.abs(y[idx_range] - y_menos))]
    idx_v2 = idx_range[np.argmin(np.abs(y[idx_range] - y_mais))]
    if idx_v1 > idx_v2:                        # garante ordem crescente
        idx_v1, idx_v2 = idx_v2, idx_v1
    return idx_v1, idx_v2

def velocidades_ciclos(t, y, ciclos, label=""):
    """
    Calcula as quatro velocidades angulares por ciclo
    (flex_lev, ext_lev, flex_sen, ext_sen) e plota a curva
    com as retas de regressão projetadas até o valor mínimo
    do ciclo.
    """
    resultados = []
    fig = go.Figure()

    for i, ciclo in enumerate(ciclos):
        # Indices-chave do ciclo: vale-pico-vale-pico-vale
        v1, p1, v2, p2, v3 = (
            ciclo["vales"][0], ciclo["picos"][0],
            ciclo["vales"][1], ciclo["picos"][1],
            ciclo["vales"][2]
        )
        y_min_ciclo = y[v1:v3 + 1].min()       # menor Ângulo do ciclo

        # ---- Definição das quatro fases ----
        fases_idx = [
            (v1, p1, 'flex_lev'),  # flexão para levantar
            (p1, v2, 'ext_lev'),   # extensão para levantar
            (v2, p2, 'flex_sen'),  # flexão para sentar
            (p2, v3, 'ext_sen')    # extensão para sentar
        ]
        fases_info = []

        for idx_ini, idx_fim, nome in fases_idx:
            i30, f30 = get_idx_30pc(t, y, idx_ini, idx_fim)
            vel, b, t0, y0, *_ = calc_vel_segmento(t, y, i30, f30)

            # ponto onde a reta atingiria y_min_ciclo
            t_proj = (y_min_ciclo - b) / vel if abs(vel) > 1e-8 else t[idx_fim]
            t_proj = np.clip(t_proj, t[v1], t[v3])  # mantém dentro do ciclo
            y_proj = vel * t_proj + b

            fases_info.append((nome, vel, t0, y0, t_proj, y_proj, b))

        # ---- Armazena resultados num dicionário ----
        resultados.append({
            "Ciclo": i + 1,
            "Vel. flexão levantar (°/s)": round(fases_info[0][1], 2),
            "Vel. extensão levantar (°/s)": round(fases_info[1][1], 2),
            "Vel. flexão sentar (°/s)":   round(fases_info[2][1], 2),
            "Vel. extensão sentar (°/s)": round(fases_info[3][1], 2),
        })

        # ---- Curva original do ciclo ----
        fig.add_trace(go.Scatter(
            x=t[v1:v3 + 1],
            y=y[v1:v3 + 1],
            mode="lines",
            line=dict(width=2),
            name=f"{label} Ciclo {i + 1}"
        ))

        # ---- Retas de regressão projetadas ----
        for j, (nome, vel, t0, y0, t_proj, y_proj, _) in enumerate(fases_info):
            fig.add_trace(go.Scatter(
                x=[t0, t_proj],
                y=[y0, y_proj],
                mode="lines",
                line=dict(width=2, color="gray", dash="dash"),
                showlegend=(i == 0 and j == 0),
                name="Projeção vel."
            ))

    # ---- Layout ----
    fig.update_layout(
        title=f"Velocidades angulares dos ciclos – {label}",
        xaxis_title="Tempo (s)",
        yaxis_title="Ângulo (°)",
        plot_bgcolor="black",
        paper_bgcolor="black",
        font_color="white",
        width=500, height=350,
        margin=dict(l=10, r=10, t=40, b=10)
    )
    return fig, resultados

def intersecao_horizontal_reta(yh, vel, b):
    """Retorna o valor de t para o qual y = vel*t + b == yh"""
    if abs(vel) < 1e-8:
        return None
    return (yh - b) / vel

def calcular_tempos_transicao_novo(ciclos, t_aligned, sinal_aligned):
    nomes_em_pe = []
    tempos_em_pe = []
    nomes_sentado = []
    tempos_sentado = []
    for i, ciclo in enumerate(ciclos):
        if len(ciclo['vales']) < 3 or len(ciclo['picos']) < 2:
            continue
        v1, p1, v2, p2, v3 = ciclo['vales'][0], ciclo['picos'][0], ciclo['vales'][1], ciclo['picos'][1], ciclo['vales'][2]
        tempo_em_pe = t_aligned[p1] - t_aligned[v1]
        nomes_em_pe.append(f"Ciclo {i+1}")
        tempos_em_pe.append(tempo_em_pe)
        tempo_sentado = t_aligned[p2] - t_aligned[v2]
        nomes_sentado.append(f"Ciclos {i+1}-{i+2}")
        tempos_sentado.append(tempo_sentado)
    return nomes_em_pe, tempos_em_pe, nomes_sentado, tempos_sentado

# --- Calcular tempos de transição em pé e sentado (Celular) ---
nomes_em_pe_cel, tempos_em_pe_cel, nomes_sentado_cel, tempos_sentado_cel = calcular_tempos_transicao_novo(ciclos_celular, t_cel_aligned, cel_aligned)

# --- Cálculo da média dos tempos de transição ---
n_ciclos_pe = len(tempos_em_pe_cel)
media_cel = np.mean(tempos_em_pe_cel) if n_ciclos_pe else 0

n_ciclos_sent = len(tempos_sentado_cel)
media_cel_sent = np.mean(tempos_sentado_cel) if n_ciclos_sent else 0

def calc_vel_segmento(t, y, idx_ini, idx_fim):
    """
    Ajusta uma reta y = vel·t + b ao trecho compreendido entre
    idx_ini e idx_fim (inclusive).
    Retorna: vel, b, t_inicial, y_inicial, vetor_t, vetor_y
    """
    t_seg = t[idx_ini:idx_fim + 1]
    y_seg = y[idx_ini:idx_fim + 1]
    vel, b = np.polyfit(t_seg, y_seg, 1)        # inclinação e intercepto
    return vel, b, t_seg[0], y_seg[0], t_seg, y_seg

def get_idx_30pc(t, y, idx1, idx2):
    """
    Localiza os 30 % abaixo e 30 % acima do ponto médio (em y),
    devolvendo os índices que mais se aproximam desses dois níveis.
    """
    y1, y2 = y[idx1], y[idx2]
    y_med   = (y1 + y2) / 2
    delta_y = 0.3 * abs(y2 - y1)               # 30 %
    y_menos = y_med - delta_y                  # −30 %
    y_mais  = y_med + delta_y                  # +30 %

    idx_range = np.arange(min(idx1, idx2), max(idx1, idx2) + 1)
    idx_v1 = idx_range[np.argmin(np.abs(y[idx_range] - y_menos))]
    idx_v2 = idx_range[np.argmin(np.abs(y[idx_range] - y_mais))]
    if idx_v1 > idx_v2:                        # garante ordem crescente
        idx_v1, idx_v2 = idx_v2, idx_v1
    return idx_v1, idx_v2

def velocidades_ciclos(t, y, ciclos):
    """
    Calcula as quatro velocidades angulares por ciclo
    (flex_lev, ext_lev, flex_sen, ext_sen).
    """
    resultados = []

    for i, ciclo in enumerate(ciclos):
        # Indices-chave do ciclo: vale-pico-vale-pico-vale
        v1, p1, v2, p2, v3 = (
            ciclo["vales"][0], ciclo["picos"][0],
            ciclo["vales"][1], ciclo["picos"][1],
            ciclo["vales"][2]
        )
        y_min_ciclo = y[v1:v3 + 1].min()       # menor Ângulo do ciclo

        # ---- Definição das quatro fases ----
        fases_idx = [
            (v1, p1, 'flex_lev'),  # flexão para levantar
            (p1, v2, 'ext_lev'),   # extensão para levantar
            (v2, p2, 'flex_sen'),  # flexão para sentar
            (p2, v3, 'ext_sen')    # extensão para sentar
        ]
        fases_info = []

        for idx_ini, idx_fim, nome in fases_idx:
            i30, f30 = get_idx_30pc(t, y, idx_ini, idx_fim)
            vel, b, t0, y0, *_ = calc_vel_segmento(t, y, i30, f30)

            # ponto onde a reta atingiria y_min_ciclo
            t_proj = (y_min_ciclo - b) / vel if abs(vel) > 1e-8 else t[idx_fim]
            t_proj = np.clip(t_proj, t[v1], t[v3])  # mantém dentro do ciclo
            y_proj = vel * t_proj + b

            fases_info.append((nome, vel, t0, y0, t_proj, y_proj, b))

        # ---- Armazena resultados num dicionário ----
        resultados.append({
            "Ciclo": i + 1,
            "Vel. flexão levantar (°/s)": round(fases_info[0][1], 2),
            "Vel. extensão levantar (°/s)": round(fases_info[1][1], 2),
            "Vel. flexão sentar (°/s)":   round(fases_info[2][1], 2),
            "Vel. extensão sentar (°/s)": round(fases_info[3][1], 2),
        })

    return resultados

# def calc_vel_segmento(t, y, idx_ini, idx_fim, nome):
#     t_seg = t[idx_ini:idx_fim+1]
#     y_seg = y[idx_ini:idx_fim+1]
#     coef = np.polyfit(t_seg, y_seg, 1)
#     vel = coef[0]
#     return vel, t_seg[0], y_seg[0], t_seg[-1], y_seg[-1], t_seg, y_seg

def get_idx_30pc(t, y, idx1, idx2):
    y1, y2 = y[idx1], y[idx2]
    y_med = (y1 + y2) / 2
    y_mais = y_med + 0.3 * abs(y2 - y1)
    y_menos = y_med - 0.3 * abs(y2 - y1)
    if idx1 < idx2:
        idx_range = np.arange(idx1, idx2+1)
    else:
        idx_range = np.arange(idx2, idx1+1)
    idx_v1 = idx_range[np.argmin(np.abs(y[idx_range] - y_menos))]
    idx_v2 = idx_range[np.argmin(np.abs(y[idx_range] - y_mais))]
    if idx_v1 > idx_v2:
        idx_v1, idx_v2 = idx_v2, idx_v1
    return idx_v1, idx_v2

def velocidades_ciclos(t, y, ciclos, label):
    resultados = []
    fig = go.Figure()
    for i, ciclo in enumerate(ciclos):
        v1, p1, v2, p2, v3 = ciclo['vales'][0], ciclo['picos'][0], ciclo['vales'][1], ciclo['picos'][1], ciclo['vales'][2]
        idx_flex1, idx_flex2 = get_idx_30pc(t, y, v1, p1)
        vel_flex_lev, t_ini1, y_ini1, t_fim1, y_fim1, t_seg1, y_seg1 = calc_vel_segmento(t, y, idx_flex1, idx_flex2, 'flex_lev')
        idx_ext1, idx_ext2 = get_idx_30pc(t, y, p1, v2)
        vel_ext_lev, t_ini2, y_ini2, t_fim2, y_fim2, t_seg2, y_seg2 = calc_vel_segmento(t, y, idx_ext1, idx_ext2, 'ext_lev')
        idx_flex3, idx_flex4 = get_idx_30pc(t, y, v2, p2)
        vel_flex_sen, t_ini3, y_ini3, t_fim3, y_fim3, t_seg3, y_seg3 = calc_vel_segmento(t, y, idx_flex3, idx_flex4, 'flex_sen')
        idx_ext3, idx_ext4 = get_idx_30pc(t, y, p2, v3)
        vel_ext_sen, t_ini4, y_ini4, t_fim4, y_fim4, t_seg4, y_seg4 = calc_vel_segmento(t, y, idx_ext3, idx_ext4, 'ext_sen')
        resultados.append({
            "Ciclo": i+1,
            "Vel. flexão levantar (°/s)": round(vel_flex_lev, 2),
            "Vel. extensão levantar (°/s)": round(vel_ext_lev, 2),
            "Vel. flexão sentar (°/s)": round(vel_flex_sen, 2),
            "Vel. extensão sentar (°/s)": round(vel_ext_sen, 2),
        })

# --- Cálculo dos tempos, amplitudes e velocidades angulares médias dos ciclos Celular ---
tempos_ciclo_cel = []
tempos_levantar_cel = []
tempos_sentar_cel = []
amp_flex_levantar_cel = []
amp_ext_levantar_cel = []
amp_flex_sentar_cel = []
amp_ext_sentar_cel = []

vel_flex_levantar_cel = []
vel_ext_levantar_cel = []
vel_flex_sentar_cel = []
vel_ext_sentar_cel = []

for i, ciclo in enumerate(ciclos_celular):
    t_ini = t_cel_aligned[ciclo['inicio']]
    t_fim = t_cel_aligned[ciclo['fim']]
    t_v1 = t_cel_aligned[ciclo['vales'][0]]
    t_v2 = t_cel_aligned[ciclo['vales'][1]]
    t_v3 = t_cel_aligned[ciclo['vales'][2]]
    tempo_total = t_fim - t_ini
    tempo_levantar = t_v2 - t_v1
    tempo_sentar = t_v3 - t_v2
    tempos_ciclo_cel.append(tempo_total)
    tempos_levantar_cel.append(tempo_levantar)
    tempos_sentar_cel.append(tempo_sentar)
    # Amplitudes angulares (graus)
    v1 = ciclo['vales'][0]
    p1 = ciclo['picos'][0]
    v2 = ciclo['vales'][1]
    p2 = ciclo['picos'][1]
    v3 = ciclo['vales'][2]
    flex_lev = abs(cel_aligned[v1] - cel_aligned[p1])
    ext_lev = abs(cel_aligned[p1] - cel_aligned[v2])
    flex_sen = abs(cel_aligned[v2] - cel_aligned[p2])
    ext_sen = abs(cel_aligned[p2] - cel_aligned[v3])
    amp_flex_levantar_cel.append(round(flex_lev, 2))
    amp_ext_levantar_cel.append(round(ext_lev, 2))
    amp_flex_sentar_cel.append(round(flex_sen, 2))
    amp_ext_sentar_cel.append(round(ext_sen, 2))
    # --- Cálculo das velocidades angulares médias (amplitude/tempo) ---
    vel_flex_lev = flex_lev / tempo_levantar if tempo_levantar != 0 else 0
    vel_ext_lev = ext_lev / tempo_levantar if tempo_levantar != 0 else 0
    vel_flex_sen = flex_sen / tempo_sentar if tempo_sentar != 0 else 0
    vel_ext_sen = ext_sen / tempo_sentar if tempo_sentar != 0 else 0
    vel_flex_levantar_cel.append(round(vel_flex_lev, 2))
    vel_ext_levantar_cel.append(round(vel_ext_lev, 2))
    vel_flex_sentar_cel.append(round(vel_flex_sen, 2))
    vel_ext_sentar_cel.append(round(vel_ext_sen, 2))

# Médias Celular
total_ciclos_cel = len(ciclos_celular)
tempo_medio_ciclo_cel = np.mean(tempos_ciclo_cel) if tempos_ciclo_cel else 0
media_levantar_cel = np.mean(tempos_levantar_cel) if tempos_levantar_cel else 0
media_sentar_cel = np.mean(tempos_sentar_cel) if tempos_sentar_cel else 0
media_flex_levantar_cel = round(np.mean(amp_flex_levantar_cel), 2) if amp_flex_levantar_cel else 0
media_ext_levantar_cel = round(np.mean(amp_ext_levantar_cel), 2) if amp_ext_levantar_cel else 0
media_flex_sentar_cel = round(np.mean(amp_flex_sentar_cel), 2) if amp_flex_sentar_cel else 0
media_ext_sentar_cel = round(np.mean(amp_ext_sentar_cel), 2) if amp_ext_sentar_cel else 0
media_vel_flex_levantar_cel = round(np.nanmean(vel_flex_levantar_cel), 2) if vel_flex_levantar_cel else 0
media_vel_ext_levantar_cel = round(np.nanmean(vel_ext_levantar_cel), 2) if vel_ext_levantar_cel else 0
media_vel_flex_sentar_cel = round(np.nanmean(vel_flex_sentar_cel), 2) if vel_flex_sentar_cel else 0
media_vel_ext_sentar_cel = round(np.nanmean(vel_ext_sentar_cel), 2) if vel_ext_sentar_cel else 0

# --- Cálculo dos Hz dos ciclos ---
hz_ciclos_cel = [round(1/t, 2) if t != 0 else 0 for t in tempos_ciclo_cel]

# --- Tabela para Celular ---
df_celular = pd.DataFrame({
    "Ciclo": [f"Ciclo {i+1}" for i in range(total_ciclos_cel)],
    "Tempo total (s)": [round(t, 2) for t in tempos_ciclo_cel],
    "Tempo levantar (s)": [round(t, 2) for t in tempos_levantar_cel],
    "Frequência (Hz)": hz_ciclos_cel,
    "Tempo sentar (s)": [round(t, 2) for t in tempos_sentar_cel],
    "Amp. flexão levantar (°)": amp_flex_levantar_cel,
    "Amp. extensão levantar (°)": amp_ext_levantar_cel,
    "Amp. flexão sentar (°)": amp_flex_sentar_cel,
    "Amp. extensão sentar (°)": amp_ext_sentar_cel,
    "Vel. flexão levantar (°/s)": vel_flex_levantar_cel,
    "Vel. extensão levantar (°/s)": vel_ext_levantar_cel,
    "Vel. flexão sentar (°/s)": vel_flex_sentar_cel,
    "Vel. extensão sentar (°/s)": vel_ext_sentar_cel,
})

# --- Atualiza totais para incluir soma do tempo total e médias das demais colunas ---
totais_celular = {}
for col in df_celular.columns:
    if col == "Ciclo":
        totais_celular[col] = "TOTAL"
    elif col == "Tempo total (s)":
        totais_celular[col] = round(df_celular[col].sum(), 2)
    elif df_celular[col].dtype != 'O':
        totais_celular[col] = round(df_celular[col].mean(), 2)
    else:
        totais_celular[col] = "TOTAL"
df_celular_tot = pd.concat([df_celular, pd.DataFrame([totais_celular])], ignore_index=True)

# --- Tabela zebra: picos e vales por ciclo para Celular ---

############################################################
# VER SE VAI FICAR
############################################################

# ----------- CELULAR -----------
cel_ciclos_picos = []
cel_ciclos_picos_tempo = []
cel_ciclos_vales = []
cel_ciclos_vales_tempo = []
ciclo_labels = []

for i, ciclo in enumerate(ciclos_celular):
    picos_idx = ciclo['picos']
    vales_idx = ciclo['vales']
    picos_val = [cel_aligned[p] for p in picos_idx]
    picos_tempo = [t_cel_aligned[p] for p in picos_idx]
    vales_val = [cel_aligned[v] for v in vales_idx]
    vales_tempo = [t_cel_aligned[v] for v in vales_idx]
    cel_ciclos_picos.append(round(np.mean(picos_val), 2) if picos_val else np.nan)
    cel_ciclos_picos_tempo.append(round(np.mean(picos_tempo), 2) if picos_tempo else np.nan)
    cel_ciclos_vales.append(round(np.mean(vales_val), 2) if vales_val else np.nan)
    cel_ciclos_vales_tempo.append(round(np.mean(vales_tempo), 2) if vales_tempo else np.nan)
    ciclo_labels.append(f"Ciclo {i+1}")

cel_media_row = {
    "Ciclo": "Média",
    "Valor médio dos picos": round(np.nanmean(cel_ciclos_picos), 2),
    "Tempo médio dos picos": round(np.nanmean(cel_ciclos_picos_tempo), 2),
    "Valor médio dos vales": round(np.nanmean(cel_ciclos_vales), 2),
    "Tempo médio dos vales": round(np.nanmean(cel_ciclos_vales_tempo), 2),
}

df_cel_picos_vales = pd.DataFrame({
    "Ciclo": ciclo_labels,
    "Valor médio dos picos": cel_ciclos_picos,
    "Tempo médio dos picos": cel_ciclos_picos_tempo,
    "Valor médio dos vales": cel_ciclos_vales,
    "Tempo médio dos vales": cel_ciclos_vales_tempo,
})
df_cel_picos_vales = pd.concat([df_cel_picos_vales, pd.DataFrame([cel_media_row])], ignore_index=True)

# --- Tabela zebra: Pico 1 e Pico 2 (valor e tempo) para Celular ---

# ----------- CELULAR -----------
cel_pico1_val = []
cel_pico1_tempo = []
cel_pico2_val = []
cel_pico2_tempo = []
ciclo_labels = []

for i, ciclo in enumerate(ciclos_celular):
    if len(ciclo['picos']) >= 2:
        p1, p2 = ciclo['picos'][0], ciclo['picos'][1]
        cel_pico1_val.append(round(cel_aligned[p1], 2))
        cel_pico1_tempo.append(round(t_cel_aligned[p1], 2))
        cel_pico2_val.append(round(cel_aligned[p2], 2))
        cel_pico2_tempo.append(round(t_cel_aligned[p2], 2))
    else:
        cel_pico1_val.append(np.nan)
        cel_pico1_tempo.append(np.nan)
        cel_pico2_val.append(np.nan)
        cel_pico2_tempo.append(np.nan)
    ciclo_labels.append(f"Ciclo {i+1}")

df_cel_picos = pd.DataFrame({
    "Ciclo": ciclo_labels,
    "Pico 1 (valor)": cel_pico1_val,
    "Pico 1 (tempo)": cel_pico1_tempo,
    "Pico 2 (valor)": cel_pico2_val,
    "Pico 2 (tempo)": cel_pico2_tempo,
})

# === Potência média (30STS) com variáveis já existentes ===
body_mass = 80.0   # kg
h = 1.70           # m
g = 9.81           # m/s²

# Altura da cadeira (46,5% da altura)
h_cadeira = 0.53 * h

# Tempo total = soma dos tempos de cada ciclo já calculados
tempo_total_ciclos = round(float(sum(tempos_ciclo_cel)), 2)

# Número de repetições = total de ciclos já calculado
repeticoes = int(total_ciclos_cel)

# Potência média (W) = (massa * g * h * repetições) / tempo_total
mean_power = (body_mass * g * h_cadeira * repeticoes) / tempo_total_ciclos if tempo_total_ciclos > 0 else float('nan')

# Prints solicitados
print("\n===== POTÊNCIA (30STS) =====")
print(f"h_cadeira (53% de h): {h_cadeira:.3f} m")
print(f"Tempo total somado dos ciclos: {tempo_total_ciclos:.2f} s")
print(f"Repetições (n ciclos): {repeticoes}")
print(f"Potência média: {mean_power:.2f} J/s")

energia_total = body_mass * g * h_cadeira * repeticoes
print(f"Energia total: {energia_total:.2f} J")

# ==============================
# Cálculo da potência por ciclo
# ==============================

# Energia por ciclo (aproximando que cada ciclo levanta o mesmo deslocamento)
energia_por_ciclo = body_mass * g * h_cadeira  # J por repetição

# Potência média por ciclo = energia do ciclo / tempo do ciclo
potencia_por_ciclo = [energia_por_ciclo / t if t > 0 else float('nan') for t in tempos_ciclo_cel]

# Print para conferência
for i, p in enumerate(potencia_por_ciclo):
    print(f"Ciclo {i+1}: Potência média = {p:.2f} J/s")

# Dados do participante
sexo = "F"  # "M" para masculino, "F" para feminino - ADICIONAR BANCO DE DADOS
idade = 60  # ADICIONAR BANCO DE DADOS
resultado_teste = total_ciclos_cel

# Função para classificar participante
def classificar_30STS(sexo, idade, resultado):
    if sexo == "F":
        # Faixas etárias e médias/desvios para mulheres (segundo tabela)
        if 60 <= idade <= 64:
            media, sd = 15.4, 4.3
        elif 65 <= idade <= 69:
            media, sd = 13.5, 4.3
        elif 70 <= idade <= 74:
            media, sd = 12.9, 3.7
        elif 75 <= idade <= 79:
            media, sd = 12.5, 3.9
        elif 80 <= idade <= 84:
            media, sd = 10.3, 4.0
        elif 85 <= idade <= 89:
            media, sd = 8.0, 5.1
        elif 90 <= idade <= 94:
            media, sd = 6.0, 4.0
        else:
            return "Idade fora da faixa da tabela"
    else:  # Masculino
        if 60 <= idade <= 64:
            media, sd = 16.4, 3.3
        elif 65 <= idade <= 69:
            media, sd = 15.2, 4.5
        elif 70 <= idade <= 74:
            media, sd = 14.5, 4.2
        elif 75 <= idade <= 79:
            media, sd = 14.0, 4.3
        elif 80 <= idade <= 84:
            media, sd = 12.4, 3.9
        elif 85 <= idade <= 89:
            media, sd = 10.3, 4.0
        elif 90 <= idade <= 94:
            media, sd = 9.7, 6.8
        else:
            return "Idade fora da faixa da tabela"

    # Classificação com base na média e desvio padrão
    if resultado < media - sd:
        return "Abaixo da média"
    elif resultado > media + sd:
        return "Acima da média"
    else:
        return "Na média"

# Print da classificação
classificacao = classificar_30STS(sexo, idade, resultado_teste)
print(f"Participante 'nome': {sexo}, {idade} anos, Resultado: {resultado_teste} -> Classificação: {classificacao}")

# DOI de referencia: 10.1123/japa.7.2.162
# URL de referencia: https://journals.humankinetics.com/view/journals/japa/7/2/article-p162.xml

# ==============================
# DataFrame com todos os outputs
# ==============================

output_dir = r"C:\Users\Matheus Beck\Desktop\Teste"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, f"output_sujeito_{sujeito}.xlsx")

num_ciclos = len(ciclos_celular)

df_out = pd.DataFrame({
    "Ciclo": [f"Ciclo {i+1}" for i in range(num_ciclos)],
    "Num ciclos Celular": [num_ciclos] * num_ciclos,
    "Tempo total Celular": tempos_ciclo_cel[:num_ciclos],
    "Tempo levantar Celular": tempos_levantar_cel[:num_ciclos],
    "Tempo sentar Celular": tempos_sentar_cel[:num_ciclos],
    "Frequência Celular": hz_ciclos_cel[:num_ciclos],
    "Transição em pé Celular": tempos_em_pe_cel[:num_ciclos],
    "Transição sentado Celular": tempos_sentado_cel[:num_ciclos],
    "Vel. flexão levantar Celular": vel_flex_levantar_cel[:num_ciclos],
    "Vel. extensão levantar Celular": vel_ext_levantar_cel[:num_ciclos],
    "Vel. flexão sentar Celular": vel_flex_sentar_cel[:num_ciclos],
    "Vel. extensão sentar Celular": vel_ext_sentar_cel[:num_ciclos],
    "Tempo Pico 1 Celular": df_cel_picos["Pico 1 (tempo)"][:num_ciclos],
    "Tempo Pico 2 Celular": df_cel_picos["Pico 2 (tempo)"][:num_ciclos],
    "Valor Pico 1 Celular": df_cel_picos["Pico 1 (valor)"][:num_ciclos],
    "Valor Pico 2 Celular": df_cel_picos["Pico 2 (valor)"][:num_ciclos],
    "Potência média ciclo (J/s)": potencia_por_ciclo,
    "Energia total (J)": [energia_total] * num_ciclos,
    "Potência média global (J/s)": [mean_power] * num_ciclos
})

# Print para conferência
print(df_out.head())

# Salvar em XLSX
df_out.to_excel(output_path, index=False)
print(f"\nArquivo salvo em: {output_path}")