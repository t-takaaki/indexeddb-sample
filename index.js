if (!window.indexedDB) {
    window.alert("このブラウザーは安定版の IndexedDB をサポートしていません。IndexedDB の機能は利用できません。");
}

// 1. データベースを開く
// DB Name, version number
const request = window.indexedDB.open("testDB", 1);
const storeName = "samples";
let db;

// create handlers
request.onerror = event => {
  console.error("Database error: ", event.target.errorCode);
};

request.onsuccess = event => {
  console.log('success');
  db = event.target.result;
  console.log(db);
  updateLists();
};

// 新しいデータベースの作成, バージョン更新(openの時に新しいバージョン番号を指定する)の際に発火
request.onupgradeneeded = event => {
  console.log('upgradeneeded');
  let db = event.target.result;
  // 2. データベース内にオブジェクトストアを作成
  // storeを作成
  db.createObjectStore(storeName, {
    keyPath : 'id', // 主キーを設定
    autoIncrement: true, // auto increment
  });
  // db.createIndexメソッドを使うと一意のインデックスも貼れる
};

const button = document.getElementById("save");
button.addEventListener("click", () => {
  // 3. データの読み書きをするためにトランザクションを張る
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  const cmt = document.getElementById("comment");
  const data = { comment: cmt.value }; // autoIncrementがONになっていると自動でidキーが作られるらしい
  // 3'. データ追加のリクエスト
  const req = store.put(data);
  req.onsuccess = () => {
    // 4. 適切な DOM イベントを受け取ることにより、操作が完了するのを待ちます
    // 5. 結果 (リクエストオブジェクトで見つけることができます) に応じた処理を行います
    cmt.value = null;
    updateLists();
  };
  transaction.oncomplete = () => {
    // onsuccess後の実行
    // トランザクション完了時の処理
    console.log("transaction complete");
  };
});

// DBに合わせてliのリスト表示
function updateLists() {
  clearNodes();

  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);

  // indexedDB storeの中身を全件取得
  // getAllはver2.0からのAPIっぽい
  store.getAll().onsuccess = event => {
    const rows = event.target.result;
    const fragment = document.createDocumentFragment();
    rows.forEach(row => {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode(`id: ${row.id}, comment: ${row.comment}`));
      fragment.appendChild(li);
    });
    document.getElementById("records").appendChild(fragment);
  };
}

function clearNodes() {
  const records = document.getElementById("records");
  // recordsの中身を削除
  const empty = records.cloneNode(false);
  records.parentNode.replaceChild(empty, records); // 空recordsと入れ替え
}
