import Order from "@/components/Order";
import Header from "@/components/header/Header";
import OrderbookTable from "@/components/OrderbookTable";

export default function Home() {
    return (
        <>
            <Header />
            <main className="flex flex-col justify-center items-center mt-8">
                <div className="w-4/5 h-96">
                    <Order />
                </div>
                {/* <div className="flex items-center justify-center bg-gray-900">
                <OrderbookTable />
            </div> */}
            </main>
        </>
    );
}
