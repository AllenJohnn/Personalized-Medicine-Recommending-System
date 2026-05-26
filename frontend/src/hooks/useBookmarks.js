import { fetchBookmarks, removeBookmark, saveBookmark } from '../api/user';

export default function useBookmarks() {
  return {
    fetchBookmarks,
    saveBookmark,
    removeBookmark,
  };
}
