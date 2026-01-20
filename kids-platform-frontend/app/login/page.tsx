export default function Home() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl shadow p-6 bg-white">
        <div className="text-2xl font-bold mb-2">Kids Platform</div>
        <div className="text-gray-600 mb-4">
          Демонстрація. Перейди до входу:
        </div>

        <a
          className="block w-full text-center rounded-xl bg-black text-white py-3 font-semibold"
          href="/login"
        >
          Відкрити /login
        </a>
      </div>
    </div>
  );
}
