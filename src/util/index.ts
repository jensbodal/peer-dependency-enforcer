const arrayContains = (hayStack: any[], needleArray: any[]) => {
  return hayStack.filter(v => needleArray.includes(v)).length > 0;
};

export { arrayContains };
