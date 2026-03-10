import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface FormHeaderProps {
    title: string;
    description: string;
    backLink: string;
}
const FormHeader = ({ title, description, backLink }: FormHeaderProps) => {
    const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(backLink)}
        className="text-foreground"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <div>
        <h1 className="text-xl font-bold text-foreground">Submit {title}</h1>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export default FormHeader