import { NavigationFailureType } from "@/lib/const";
import { Route } from "@/types/type";

export function createNavigationRedirectError(to: Route, from: Route) {
  return createRouterError(
    from,
    to,
    NavigationFailureType.redirected,
    `[PTool]:当${from.url}跳转到${to.url}时由守卫执行了重定向`,
  );
}

export function createNavigationAbortedError(to: Route, from: Route) {
  return createRouterError(from, to, NavigationFailureType.aborted, `[PTool]:当${from.url}跳转到${to.url}时由守卫中断了跳转`);
}
export function createNavigationCancelledError(from, to) {
  return createRouterError(
    from,
    to,
    NavigationFailureType.cancelled,
    `[PTool]:跳转取消 = (${from.url} => ${to.url}),执行新的跳转`,
  );
}
export function createNavigationDuplicatedError(from, to) {
  const error = createRouterError(
    from,
    to,
    NavigationFailureType.duplicated,
    `[PTool]:避免重复跳转同一个页面，当前重复跳转页面路径 => "${from.url}".`,
  );
  // backwards compatible with the first introduction of Errors
  error.name = "NavigationDuplicated";
  return error;
}

export function createRouterError(from, to, type, message) {
  const error: {
    message: string;
    name?: string;
    _isRouter?: boolean;
    to?: Route;
    from?: Route;
    type?: NavigationFailureType;
  } = { message };
  error._isRouter = true;
  error.from = from;
  error.to = to;
  error.type = type;

  return error;
}
