export const structurePaginatedData = <T>(
  records: T[],
  totalRecords: number,
  page: number,
  perPage: number,
) => {
  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  if (records.length === 0) {
    return {
      records: [],
      totalRecords,
      currentPage: page,
      totalPages,
      perPage: perPage,
      recordStart: 1,
      recordEnd: totalPages,
    };
  }

  return {
    records,
    totalRecords,
    currentPage: page,
    totalPages,
    perPage: perPage,
    recordStart: 0,
    recordEnd: totalPages,
  };
};
