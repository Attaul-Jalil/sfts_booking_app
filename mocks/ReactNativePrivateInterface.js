module.exports = {
  legacySendAccessibilityEvent: () => {},
  Platform: {
      OS: 'web',
      select: (options) => options.web || options.default,
  },
  ExceptionsManager: {
      reportException: () => {},
      dismissRedbox: () => {}
  },
  BatchedBridge: {},
  RCTEventEmitter: {
      register: () => {},
      emit: () => {}
  },
  ReactNativeViewConfigRegistry: {
      register: () => {},
      get: () => {}
  },
  TextInputState: {
      currentlyFocusedField: () => null,
      blurTextInput: () => {},
      focusTextInput: () => {},
  },
  UIManager: {
      dispatchViewManagerCommand: () => {},
      setJSResponder: () => {},
      clearJSResponder: () => {},
  },
  deepDiffer: () => false,
  deepFreezeAndThrowOnMutationInDev: (obj) => obj,
  flattenStyle: (style) => style,
  ReactFiberErrorDialog: {
      showErrorDialog: () => {}
  },
  CustomEvent: function CustomEvent() {}
};
