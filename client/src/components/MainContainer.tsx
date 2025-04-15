import { ReactNode } from "react"
import Navbar from "../utility/Header"

interface MyComponentsProps {
  children: ReactNode
}
const MainContainer: React.FC<MyComponentsProps> = ({ children }) => {
  return (
    <div className="">
      <Navbar/>
      {children}
    </div>
  )
}

export default MainContainer
