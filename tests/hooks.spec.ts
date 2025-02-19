import { replaced, shadowed } from "../dist/template";
import { useAnchor, useChildView, useCleanUpCollector, useEvent, useHost, useParent, useRef } from "../dist/hooks";
import { after, appendChild } from "../dist/core";
import type { AttachFunc, Rendered } from "../dist/types";
import { noop } from "../dist/util";
describe("hooks.ts", () => {
  describe("basic hooks", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });
    afterEach(() => {
      document.body.innerHTML = "";
    });
    it("should emit error when calling hooks outside setup", () => {
      expect(() => {
        useHost();
      }).toThrow(/invalid hook call/i);
    });
    it("should return elements for shadowed", () => {
      const App = shadowed(``)(() => {
        const host = useHost();
        const customElement = document.body.firstElementChild!;
        expect(host).toBe(customElement.shadowRoot);
        const parent = useParent();
        expect(parent).toBe(customElement.parentElement);
      });
      const [cleanup] = App({})(appendChild(document.body));
      cleanup();
    });
    it("should return elements for replaced", () => {
      const App = replaced(``)(() => {
        const host = useHost();
        expect(host).toBe(document.body);
        const parent = useParent();
        expect(parent).toBe(document.body);
      });
      const [cleanup] = App({})(appendChild(document.body));
      cleanup();
    });
    it("should call registered cleanup on component unmount", () => {
      const cleanupMock = import.meta.jest.fn();
      const App = replaced(``)(() => {
        useCleanUpCollector()(cleanupMock);
      });
      const [cleanup] = App({})(appendChild(document.body));
      cleanup();
      expect(cleanupMock).toBeCalledTimes(1);
    });
  });

  describe("advanced hooks", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });
    afterEach(() => {
      document.body.innerHTML = "";
    });
    it("should create and destroy child view", () => {
      const childViewDestroy = import.meta.jest.fn();
      const childFactory = import.meta.jest.fn((): Rendered<void> => {
        return [childViewDestroy, undefined, noop];
      });
      const App = replaced(`<div><p #p1>1</p><p #p2></p></div>`)(() => {
        const p2 = useAnchor("p2")!;
        useChildView(childFactory)(after(p2));
      });
      const [cleanup] = App({})(appendChild(document.body));
      expect(childFactory).toBeCalledTimes(1);
      expect(childViewDestroy).toBeCalledTimes(0);
      cleanup();
      expect(childViewDestroy).toBeCalledTimes(1);
    });
    it("should add event listener and remove it", () => {
      const handler = import.meta.jest.fn();
      const App = replaced(`<div>
      <button></button>
      </div>`)(() => {
        const button = useRef("button")!;
        useEvent(button)('click', handler);
        return {
          button,
        };
      });
      const [cleanup, {button}] = App({})(appendChild(document.body));
      button.click();
      expect(handler).toBeCalledTimes(1);
      button.click();
      expect(handler).toBeCalledTimes(2);
      cleanup();
      button.click();
      expect(handler).toBeCalledTimes(2);
    });
  });
});
