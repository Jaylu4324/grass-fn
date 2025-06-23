import { useState } from "react";
import Sidebar from "./Sidebar";


const MainLayout = (props:any) => {
    const [isOpen, setIsOpen] = useState(true)
    const toggleSidebar = () => setIsOpen(!isOpen)
    return (<div className="flex h-screen" >


        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

        <div className={`w-full flex overflow-hidden flex-col ${isOpen?"md:ml-64":"md:ml-20"}`} >
            <div className="h-18 p-4  bg-[#D9FFB3] w-full ">
                {props.title}
            </div>
            <div className="max-h-full h-full bg-[#f2f7fe] overflow-auto p-8">
                {props.children}

            </div>

        </div>

    </div>)
}
export default MainLayout