import { Button } from "../ui/button"

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-12">
      <div className="text-xl font-semibold">Yield Cycle</div>
      <Button
        variant="outline"
        className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black bg-transparent"
      >
        Connect Wallet
      </Button>
    </header>
  )
}
