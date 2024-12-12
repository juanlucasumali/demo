import { router } from '../main'

export const navigation = {
  navigate: (to: string, options?: { replace?: boolean }) => {
    router.navigate({ to, replace: options?.replace })
  },
  
  goBack: () => {
    router.history.back()
  },
  
  goForward: () => {
    router.history.forward()
  },
  
  getCurrentPath: () => {
    return router.state.location.pathname
  }
}
