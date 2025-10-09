import { InstructionsCard } from "@/components/excel-vihecles/instructions-card";
import { MenuBar } from "@/components/excel-vihecles/menu-bar";
import MainContainer from "@/components/MainContainer";

export default function PageExcelVihecles() {
  return (
    <MainContainer>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <InstructionsCard />
        <MenuBar />
      </div>
    </MainContainer>
  );
}
