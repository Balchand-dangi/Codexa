import React from 'react'

function Contact() {
    return (
        <div>
            <nav className="bg-blue-950 text-white py-14 px-6 flex flex-col md:flex-row 
                            md:justify-around md:items-center text-sm md:text-base gap-4 md:gap-0 font-medium">

                <li >Owner: Balchand Dangi</li>
                
                <li className="">Gmail: <a className=" cursor-pointer underline hover:text-blue-500" href="Gmail:"> dangibalchand935@gmail.com</a>
                </li>
                <li >Contact: 6232579495</li>

            </nav>

            <div className="py-2 bg-black"></div>
        </div>
    )
}

export default Contact
