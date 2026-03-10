interface InputProps {
    label: string;
    placeholder?: string;
    type?: string;
    name: string;
    value: string | number;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    variant?: "input" | "select" | "textarea";
    option?: { value: string; label: string }[]
    className?: string;
    required?: boolean;
    optional?: boolean;
    maxLength?: number;
}

const CustomInput = (props: InputProps) => {
  return (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-foreground mb-1">{props.label}{props.required && <span className="text-red-500 text-destructive ml-0.5">*</span>}{props.optional && <span className="text-muted-foreground ml-0.5  text-xs">(Optional)</span>}</label>
        {props.variant === "select" ? (
            <select id={props.name} name={props.name} value={props.value} onChange={props.onChange} className={`w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 ${props.className}`}>
              <option value=''>Select an option</option>
             {props.option?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
        ) : props.variant === "textarea" ? (
            <textarea
                id={props.name}
                name={props.name}
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
                onFocus={props.onFocus}
  onBlur={props.onBlur}
                className={`w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 ${props.className}`}
            />
        ) : (
        <input
            type={props.type || "text"}
            placeholder={props.placeholder}
            name={props.name}
            value={props.value}
            onChange={props.onChange}
            onFocus={props.onFocus}
            maxLength={props.maxLength}
  onBlur={props.onBlur}
            className={`w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 ${props.className}`}
        />
        )}
    </div>
  )
}

export default CustomInput