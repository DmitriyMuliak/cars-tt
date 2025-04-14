import { type ComponentType, createElement } from 'react';
import { QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  type RenderHookOptions,
  type RenderHookResult,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';

export const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: { retry: false, retryDelay: 0 },
  },
};

interface MakeWrapperParams {
  queryClientConfig?: QueryClientConfig;
}

interface MakeWrapperOptions {
  options?: MakeWrapperParams;
}

function makeWrapper(params: MakeWrapperParams = {}) {
  const client = new QueryClient(params.queryClientConfig ?? defaultQueryClientConfig);
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

export function renderHook<Result, Props>(
  hook: (props: Props) => Result,
  { options, ...rtlOptions }: RenderHookOptions<Props> & MakeWrapperOptions = {},
): RenderHookResult<Result, Props> {
  return rtlRenderHook(hook, {
    wrapper: makeWrapper(options),
    ...rtlOptions,
  });
}

export function render(
  Component: ComponentType,
  { options, ...rtlOptions }: RenderOptions & MakeWrapperOptions = {},
): RenderResult {
  return rtlRender(createElement(Component), {
    wrapper: makeWrapper(options),
    ...rtlOptions,
  });
}
