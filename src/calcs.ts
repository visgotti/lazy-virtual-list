interface ResolveIndexesParams {
  scrollTop: number;
  viewHeight: number;
  itemSize: number;
  totalItems: number;
  itemBuffer: number;
  dynamicSizes?: { [index: string]: number };
}

interface ResolveIndexesResult {
  startIndex: number;
  endIndex: number;
  startVisibleIndex: number;
  endVisibleIndex: number;
  totalItemHeight: number;
  startOverflow: number,
  startElementPosition: number,
  startVisibleElementPosition: number,
  endElementPosition: number,
  endVisibleElementPosition: number,
  endOverflow: number,
  startVisiblePosition: number,
  endVisiblePosition: number;
}

type Dataset = {
  startingIndex: number;
  data: Array<any>;
};

interface FillItemArrayParams {
  orderedDatasets: Dataset[];
  startIndex: number;
  endIndex: number;
}

export const fillItemArray = ({
  orderedDatasets,
  startIndex,
  endIndex,
}: FillItemArrayParams): Array<any | null> => {
  const items: Array<any | null> = new Array(endIndex - startIndex + 1).fill(null);
  for (let i = 0; i < orderedDatasets.length; i++) {
    const { startingIndex, data } = orderedDatasets[i];
    const datasetEndingIndex = startingIndex + data.length - 1;

    // Definitely no more items to be found if starting index of the dataset is greater than the end visible index
    if (startingIndex > endIndex) {
      return items;
    }

    // Skip datasets that are completely before the visible range
    if (datasetEndingIndex < startIndex) {
      continue;
    }
    
    for (let j = 0; j < data.length; j++) {
      const itemIndex = startingIndex + j;
      // If the item falls within the visible range, set it in the items array
      if (itemIndex >= startIndex && itemIndex <= endIndex) {
        items[itemIndex - startIndex] = data[j];
      }
    }
  }
  return items;
};


export const resolveIndexes = ({
  scrollTop,
  viewHeight,
  itemSize,
  totalItems,
  itemBuffer,
  dynamicSizes = {},
}: ResolveIndexesParams): ResolveIndexesResult => {
  const getItemHeight = (index: number) => {
    return index in dynamicSizes ? dynamicSizes[index] : itemSize;
  };

  let offset = 0;
  let startVisibleIndex = 0;

  const dynamicSized = Object.keys(dynamicSizes);
  const unresizedItemHeights =  itemSize * (totalItems - dynamicSized.length);
  const resizedItemHeights = dynamicSized.reduce((pv, cv) =>  pv + dynamicSizes[cv], 0);
  const totalItemHeight = unresizedItemHeights + resizedItemHeights;

  let startVisiblePosition = 0;
  let startOverflow = 0;
  for (let i = 0; i < totalItems; i++) {
    const itemHeight = getItemHeight(i);
    const next = offset + itemHeight;
    if (next > scrollTop) {
      startOverflow =  (next - scrollTop) - itemHeight;
      startVisibleIndex = i;
      startVisiblePosition = next - (next-scrollTop);
      break;
    }
    offset = next;
  }
  const startVisibleElementPosition = offset - scrollTop; 
  offset = startOverflow;

  let endOverflow = 0;
  let endVisibleIndex = startVisibleIndex;
  let endVisiblePosition = 0;
  for (let i = startVisibleIndex; i < totalItems; i++) {
    const itemHeight = getItemHeight(i);
    const next = offset + itemHeight;
    if (next >= viewHeight) {
      endOverflow = (next - viewHeight);
      endVisibleIndex = i;
      endVisiblePosition = next - (next-viewHeight);
      break;
    }
    offset = next;
  }

  const endVisibleElementPosition = offset - endOverflow;
  const startIndex = Math.max(startVisibleIndex - itemBuffer, 0);
  const endIndex = Math.min(endVisibleIndex + itemBuffer, totalItems - 1);
  let startElementPosition = startVisibleElementPosition;
  for(let i = startVisibleIndex; i > startIndex; i--) {
    startElementPosition -= getItemHeight(i);
  }

  let endElementPosition = endVisibleElementPosition;
  for(let i = endVisibleIndex; i < endIndex; i++) {
    endElementPosition += getItemHeight(i);
  }

  return {
    totalItemHeight,
    startVisiblePosition,
    endVisiblePosition,
    startVisibleIndex,
    startOverflow,
    startElementPosition,
    startVisibleElementPosition,

    endVisibleIndex,
    endOverflow,
    endElementPosition,
    endVisibleElementPosition, 
    
    startIndex,
    endIndex,
  };
};