import { fillItemArray, resolveIndexes } from '../src/calcs'; // Adjust the import according to your file structure

describe('resolveIndexes', () => {
  it('should correctly resolve indexes and heights for static item sizes', () => {
    const params = {
      scrollTop: 0,
      viewHeight: 300,
      itemSize: 30,
      totalItems: 100,
      itemBuffer: 3,
      dynamicSizes: {},
    };
    const {
      totalItemHeight,

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
    } = resolveIndexes(params);

    expect(totalItemHeight).toBe(params.itemSize * params.totalItems);
    expect(startVisibleIndex).toBe(0);
    expect(startIndex).toBe(0);
    expect(startOverflow).toBe(0);
    expect(startElementPosition).toBe(0);
    expect(startVisibleElementPosition).toBe(0);


    expect(endVisibleIndex).toBe(9);
    expect(endIndex).toBe(12);
    expect(endOverflow).toBe(0);
    expect(endVisibleElementPosition).toBe(270);
    expect(endElementPosition).toBe(360); // Adjust based on remaining height
  });

  it('should correctly resolve indexes and heights for static item sizes with a little scroll top', () => {
    const params = {
      scrollTop: 40,
      viewHeight: 300,
      itemSize: 30,
      totalItems: 100,
      itemBuffer: 3,
      dynamicSizes: {},
    };
    const {
      totalItemHeight,

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
    } = resolveIndexes(params);

    expect(totalItemHeight).toBe(params.itemSize * params.totalItems);
    expect(startVisibleIndex).toBe(1);
    expect(startIndex).toBe(0);
    expect(startOverflow).toBe(-10);
    expect(startElementPosition).toBe(-40);
    expect(startVisibleElementPosition).toBe(-10);


    expect(endVisibleIndex).toBe(11);
    expect(endIndex).toBe(14);
    expect(endOverflow).toBe(20);
    expect(endVisibleElementPosition).toBe(270);
    expect(endElementPosition).toBe(360); // Adjust based on remaining height
  });

  
  it('tests dynamic sized items still get computed correctly', () => {
    const dynamicSizeItem = 150;
    const params = {
      scrollTop: 140,
      viewHeight: 300,
      itemSize: 30,
      totalItems: 100,
      itemBuffer: 3,
      dynamicSizes: {
        0: dynamicSizeItem,
      },
    };

    const {
      totalItemHeight,

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
    } = resolveIndexes(params);

    expect(totalItemHeight).toBe(params.itemSize*(params.totalItems-1) + dynamicSizeItem);
    expect(startVisibleIndex).toBe(0);
    expect(startIndex).toBe(0);
    expect(startOverflow).toBe(-140);
    expect(startElementPosition).toBe(-140);
    expect(startVisibleElementPosition).toBe(-140);


    expect(endVisibleIndex).toBe(10);
    expect(endIndex).toBe(13);
    expect(endOverflow).toBe(10);
    expect(endVisibleElementPosition).toBe(270);
    expect(endElementPosition).toBe(360); // Adjust based on remaining height


  });
});

type Dataset = {
  startingIndex: number;
  data: Array<any>;
};
describe('fillItemArray', () => {
  it('should fill the array with data items within the visible range', () => {
    const orderedDatasets: Dataset[] = [
      { startingIndex: 0, data: ['a', 'b', 'c'] },
      { startingIndex: 3, data: ['d', 'e', 'f'] },
    ];
    const startIndex = 1;
    const endIndex = 4;

    const result = fillItemArray({ orderedDatasets, startIndex, endIndex });

    expect(result).toEqual(['b', 'c', 'd', 'e']);
  });

  it('should return an array filled with nulls if no data items fall within the visible range', () => {
    const orderedDatasets: Dataset[] = [
      { startingIndex: 0, data: ['a', 'b', 'c'] },
      { startingIndex: 3, data: ['d', 'e', 'f'] },
    ];
    const startIndex = 6;
    const endIndex = 8;

    const result = fillItemArray({ orderedDatasets, startIndex, endIndex });

    expect(result).toEqual([null, null, null]);
  });

  it('should partially fill the array if some data items fall within the visible range', () => {
    const orderedDatasets: Dataset[] = [
      { startingIndex: 0, data: ['a', 'b', 'c'] },
      { startingIndex: 3, data: ['d', 'e', 'f'] },
    ];
    const startIndex = 2;
    const endIndex = 5;

    const result = fillItemArray({ orderedDatasets, startIndex, endIndex });

    expect(result).toEqual(['c', 'd', 'e', 'f']);
  });
});