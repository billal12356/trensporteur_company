import { Helmet } from "react-helmet-async";
import MainContainer from "../../components/MainContainer";


const Page = () => {

  return (
    <MainContainer>
      <Helmet>
        <title>الصفحة الرئيسية</title>
        <meta name="description" content="مرحبا بك في Finissio" />
        <link rel="icon" type="image/png" href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s" />
      </Helmet>
      <div className="">home</div>
    </MainContainer>
  )
}

export default Page
