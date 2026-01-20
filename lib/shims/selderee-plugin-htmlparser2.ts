type PickerLike = {
  pick1: () => null;
  pickAll: () => [];
};

export function hp2Builder(): PickerLike {
  return {
    pick1: () => null,
    pickAll: () => [],
  };
}
