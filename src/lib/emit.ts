interface Emitter {
  on(event: string | "*", callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  off(event: string | "*", callback: (...args: any[]) => void): void;
}
class Emit {
  [x: string]: any;
  _all: Map<string, ((type: string, ...args: any[]) => void)[]>;
  constructor(all?) {
    this._all = all || new Map();
  }
  on(type: string | "*", handler: (...args: any[]) => void) {
    const handlers = this._all?.get(type);
    const added = handlers && handlers.push(handler);
    if (!!added == false) {
      this._all.set(type, [handler]);
    }
  }
  off(type: string | "*", handler: (...args: any[]) => void) {
    const handlers = this._all?.get(type);
    if (!!handler == false) {
      this._all?.set(type, null);
    } else if (!!handlers) {
      const deleteIndex = handlers.findIndex((fn) => {
        return fn === handler;
      });
      deleteIndex > -1 && handlers.splice(deleteIndex, 1);
    }
  }
  emit(type: string, ...args: any[]) {
    const wildHandler = this._all?.get("*");
    const handlers = this._all?.get(type);
    wildHandler &&
      wildHandler.forEach((fn) => {
        fn.call(null, type, ...args);
      });
    handlers &&
      handlers.forEach((fn) => {
        fn.apply(null, args);
      });
  }
  clean(): void {
    this._all.clear();
  }
  assign<T extends object>(target: T): T & Emitter {
    const msg = this;
    let methods = ["on", "off", "emit"];
    methods.forEach((methodName) => {
      const method = msg[methodName];
      target[methodName] = function () {
        method.apply(msg, arguments);
      };
    });
    return target as T & Emitter;
  }
}

export default Emit;
