import { LoginButton } from "@/components/auth/LoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI家計簿</h1>
          <p className="text-gray-600">GenAI搭載のスマート家計簿アプリ</p>
        </div>

        <div className="flex justify-center">
          <LoginButton />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>ログインすることで、</p>
          <p>利用規約とプライバシーポリシーに同意したものとみなします</p>
        </div>
      </div>
    </div>
  );
}
