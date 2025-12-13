"use client";

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-60 mb-4">認証エラー</h1>
        <p className="text-gray-70 mb-4">
          認証処理中にエラーが発生しました。もう一度お試しください。
        </p>
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
        >
          ログインページに戻る
        </a>
      </div>
    </div>
  );
}
