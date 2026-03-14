export type QuestionOption = {
    id: string;
    label: string;
    score: number;
};

export type Question = {
    id: number;
    title: string;
    options: QuestionOption[];
};

export const IVCF20_QUESTIONS: Question[] = [
    {
        id: 1,
        title: "Idade do(a) sr(a)?",
        options: [
            { id: "1", label: "Entre 60 e 74 anos", score: 0 },
            { id: "2", label: "Entre 74 e 84 anos", score: 1 },
            { id: "3", label: "85 anos ou mais", score: 3},
        ],
    },
    {
        id: 2,
        title: "No geral, comparando com pessoas da sua idade, como o(a) sr(a) avalia a sua própria saúde?",
        options: [
            { id: "1", label: "Excelente", score: 0 },
            { id: "2", label: "Muito boa", score: 0  },
            { id: "3", label: "Boa" , score: 0 },
            { id: "4", label: "Regular", score:1 },
            { id: "5", label: "Ruim", score: 1 },
        ],
    },
    {
        id: 3,
        title: "Por causa de sua saúde ou condição física, você deixou de fazer compras?",
        options: [
            { id: "1", label: "Sim" , score: 4},
            { id: "2", label: "Não" , score: 0},
        ],
    },
    {
        id: 4,
        title: "Por causa de sua saúde ou condição física, você deixou de controlar seu dinheiro, gastos ou pagar as contas de sua casa?",
        options: [
            { id: "1", label: "Sim", score: 4  },
            { id: "2", label: "Não", score: 0  },
        ],
    },
    {
        id: 5,
        title: "Por causa de sua saúde ou condição física, você deixou de realizar pequenos trabalhos domésticos? Como lavar a louça, limpar a casa ?",
        options: [
            { id: "1", label: "Sim", score: 4 },
            { id: "2", label: "Não" , score: 0},
        ],
    },
    {
        id: 6,
        title: "Por causa de sua saúde ou condição física, você deixou de tomar banho sozinho ?",
        options: [
            { id: "1", label: "Sim", score: 6},
            { id: "2", label: "Não", score: 0 },
        ],
    },
    {
        id: 7,
        title: "Algum amigo ou familiar já comentou que o(a) sr(a) está mais esquecido(a)?",
        options: [
            { id: "1", label: "Sim", score: 1},
            { id: "2", label: "Não", score: 0 },
        ],
    },
    {
        id: 8,
        title: "Este esquecimento está piorando nos últimos meses?",
        options: [
            { id: "1", label: "Sim", score: 1},
            { id: "2", label: "Não" , score: 0},
        ],
    },
    {
        id: 9,
        title: "Este esquecimento está impedindo a realização de alguma atividade do cotidiano?",
        options: [
            { id: "1", label: "Sim", score: 2 },
            { id: "2", label: "Não", score: 0 },
        ],
    },
    {
        id: 10,
        title: "Nos último mês, você ficou com desânimo, tristeza ou desesperança?",
        options: [
            { id: "1", label: "Sim", score: 2  },
            { id: "2", label: "Não", score: 0},
        ],
    },
    {
        id: 11,
        title: "Nos último mês você perdeu o interesse ou prazer em atividades anteriormente prazerosas?",
        options: [
            { id: "1", label: "Sim", score:2 },
            { id: "2", label: "Não", score: 0},
        ],
    },
    {
        id: 12,
        title: "Você é incapaz de elevar os braços acima do nível do ombro?",
        options: [
            { id: "1", label: "Sim", score: 1 },
            { id: "2", label: "Não", score: 0 },
        ],
    },
    {
        id: 13,
        title: "Você é incapaz de manusear ou segurar pequenos objetos?",
        options: [
            { id: "1", label: "Sim", score: 1 },
            { id: "2", label: "Não", score: 0 },
            
        ],
    },
    {
        id: 14,
        title: "Você tem alguma das quatro condições abaixo?",
        options: [
            { id: "1", label: "Perda de peso não intencional de 4,5 kg ou 5% do peso corporal no último ano ou 6 kg nos últimos 6 meses ou 3 kg no último mês ?", score: 2 },
            { id: "2", label: "IMC menor que 22 kg/m²", score: 2 },
            { id: "3", label: "Circunferência da panturrilha menor que 31 cm", score: 2 },
            { id: "4", label:"Tempo gasto no teste de velcoidade de marcha (4m) maior que 5 segundos", score: 2},
            {id: "5", label:"Nenhuma das condições", score: 0}
        ],
    },
    {
        id: 15,
        title: "Você tem dificuldade para caminhar capaz de impedir a realização de alguma atividade do cotidiano?",
        options: [
            { id: "1", label: "Sim", score: 2 },
            { id: "2", label: "Não", score: 0 },
        ],
    },
    {
        id: 16,
        title: "Você teve duas ou mais quedas no último ano?",
        options: [
            { id: "1", label: "Sim", score: 2 },
            { id: "2", label: "Não", score: 0 },
        ],
    },
    {
        id: 17,
        title: "Você perde urina ou fezes, sem querer, em algum momento?",
        options: [
            { id: "1", label: "Sim", score: 2 },
            { id: "2", label: "Não", score: 0 },
        ],
    },
    {
        id: 18,
        title: "Você tem problemas de visão capazes de impedir a realização de alguma atividade do cotidiano? É permitido o uso de óculos ou lentes de contato",
        options: [
            { id: "1", label: "Sim", score: 2 },
            { id: "2", label: "Não", score: 0},
        ],
    },
    {
        id: 19,
        title: "Você tem problemas de problemas de audição capazes de impedir a realização de alguma atividade do cotidiano? É permitido o uso de aparelhos de audição",
        options: [
            { id: "1", label: "Sim", score: 2 },
            { id: "2", label: "Não", score: 0 },
        ],
    },
    {
        id: 20,
        title: "Você tem alguma das três condições abaixo relacionadas ?",
        options: [
            { id: "1", label: "Cinco ou mais doenças crônicas", score: 4 },
            { id: "2", label: "Uso regular de cinco ou mais medicamentos diferentes, todo dia", score: 4 },
            { id: "3", label: "Internação recente, nos últimos 6 meses ?", score: 4 },
            {id: "4", label: "Nenhuma condição", score: 0}
        ],
    },
];

