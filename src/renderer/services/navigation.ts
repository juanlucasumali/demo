import { router } from '../main'
import { useNavigationStore } from '../stores/useNavigationStore'

export const navigation = {
  navigate: (to: string, options?: { replace?: boolean }) => {
    useNavigationStore.getState().setLastVisitedPath(to)
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
  },

  getLastVisitedPath: () => {
    return useNavigationStore.getState().getLastVisitedPath()
  }
}
