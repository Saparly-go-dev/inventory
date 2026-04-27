export interface Paginator<T> {
  items: T[];
  page_size: number;
  page_number: number;
  page_count: number;
  total: number;
  total_pages?: number;
  total_items?: number;
}

export function getPageCount<T>(page: Paginator<T>): number {
  return Math.max(1, page.page_count ?? page.total_pages ?? 1);
}
