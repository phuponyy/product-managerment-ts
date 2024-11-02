interface ObjectPagination {
  currentPage: number;
  limitItems: number;
  skip?: number;
  totalPages?: number;
}

const paginationHelper = (
  objectPagination: ObjectPagination,
  query: Record<string, any>,
  countRecords: number
): ObjectPagination => {
  if (query.page) {
    objectPagination.currentPage = parseInt(query.page);
  }

  if (query.limit) {
    objectPagination.limitItems = parseInt(query.limit);
  }

  objectPagination.skip =
    (objectPagination.currentPage - 1) * objectPagination.limitItems;

  objectPagination.totalPages = Math.ceil(
    countRecords / objectPagination.limitItems
  );

  return objectPagination;
};

export default paginationHelper;
