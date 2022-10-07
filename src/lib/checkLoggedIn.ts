import { Middleware } from '@koa/router'

const checkLoggedIn: Middleware = (ctx, next) => {
  if (!ctx.state.user) {
    // 로그인상태가 아니라면 401 반환
    ctx.status = 401
    return
  }
  return next()
}

export default checkLoggedIn
