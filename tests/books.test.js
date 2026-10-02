import test from "node:test";
import assert from "node:assert/strict";
import { books } from "../supabase/book-data.js";
test("Lise defterlerinden 90 kitap; kaynakta olmayan 12. sınıf listesi uydurulmaz", () => {
  assert.equal(books.length, 90);
  for (let grade = 9; grade <= 11; grade++)
    assert.equal(books.filter((b) => b.grade === grade).length, 30);
  assert.equal(
    new Set(books.map((b) => `${b.grade}/${b.title}/${b.author}`)).size,
    90,
  );
});
