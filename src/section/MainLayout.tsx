import Sidebar from "./Sidebar";


const MainLayout = (props) => {
    return (<div className="flex h-screen" >
        <Sidebar />
        <div className="w-full flex flex-col">
            <div className="h-18 p-4  bg-red-500 w-full">
                {props.title}
            </div>
            <div className="max-h-full h-full bg-yellow-100 overflow-y-auto">
                {props.children}

            </div>

        </div>

    </div>)
}
export default MainLayout