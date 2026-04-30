
export interface EventDetailed<T = unknown> extends Event {
  detail?: T,
};
