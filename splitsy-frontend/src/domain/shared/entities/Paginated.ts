export interface PaginatedObjects<T> {
  pagination: Paginated;
  objects: T[];
}

export interface Paginated {
  count: number;
  total: number;
}