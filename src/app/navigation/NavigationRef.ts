import { createNavigationContainerRef } from "@react-navigation/native"

import type { RootStackParamList } from "../shared/RootStackParamList"


export const navigationRef = createNavigationContainerRef<RootStackParamList>()

export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[RouteName]
    ? [name: RouteName] | [name: RouteName, params: RootStackParamList[RouteName]]
    : [name: RouteName, params: RootStackParamList[RouteName]]
) {
  if (!navigationRef.isReady()) return

  navigationRef.navigate(...(args as any))
}

export function reset<RouteName extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[RouteName]
    ? [name: RouteName] | [name: RouteName, params: RootStackParamList[RouteName]]
    : [name: RouteName, params: RootStackParamList[RouteName]]
) {
  if (!navigationRef.isReady()) return

  const [name, params] = args

  navigationRef.reset({
    index: 0,
    routes: [{ name: name as any, params: params as any }],
  })
}