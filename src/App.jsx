import "./App.css";
import db from "./firebase";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";

function App() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null); // 現在編集中の投稿

  useEffect(() => {
    // DBからデータ取得
    const postData = collection(db, "posts");
    getDocs(postData).then((snapShot) => {
      setPosts(snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // リアルタイムでDBからデータ取得
    onSnapshot(postData, (post) => {
      setPosts(post.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleDelete = async (id) => {

    try {
      const postRef = doc(db, "posts", id);
      await deleteDoc(postRef);
    } catch (error) {
      console.error("削除エラー:", error);
    }

  };

  const handleEdit = (post) => {
    setEditingPost(post); // 編集する投稿をセット
  };

  return (
    <>
      <div className="container">
        <h1>Hello React & Firebase</h1>
        <Form editingPost={editingPost} setEditingPost={setEditingPost} />
        <div className="space-y-md">
          {posts.map((post) => (
            <section key={post.id} className="post">
              <h3>{post.title}</h3>
              <p>{post.text}</p>
              <button className="btn01" onClick={() => handleEdit(post)}>編集</button>
              <button className="btn01" onClick={() => handleDelete(post.id)}>削除</button>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

// データ追加・編集用フォームコンポーネント
function Form({ editingPost, setEditingPost }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setText(editingPost.text);
    } else {
      setTitle("");
      setText("");
    }
  }, [editingPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() === "" || text.trim() === "") {
      alert("タイトルとテキストを入力してください。");
      return;
    }

    try {
      if (editingPost) {
        // 編集モード
        const postRef = doc(db, "posts", editingPost.id);
        await updateDoc(postRef, { title, text });
        // alert("投稿が更新されました！");
        setEditingPost(null);
      } else {
        // 新規作成モード
        const postRef = collection(db, "posts");
        await addDoc(postRef, { title, text, createdAt: new Date() });
        // alert("投稿が追加されました！");
      }
      setTitle("");
      setText("");
    } catch (error) {
      console.error("エラー:", error);
      alert("操作に失敗しました。");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <div>
        <label>
          タイトル:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトルを入力"
          />
        </label>
      </div>
      <div>
        <label>
          テキスト:
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="テキストを入力"
          />
        </label>
      </div>
      <button type="submit">
        {editingPost ? "更新する" : "投稿する"}
      </button>
      {editingPost && (
        <button
          type="button"
          onClick={() => setEditingPost(null)}
          className="btn-cancel"
        >
          キャンセル
        </button>
      )}
    </form>
  );
}

export default App;
