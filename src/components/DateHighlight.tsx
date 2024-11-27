import { format, isValid, parse } from "date-fns";

interface DateHighlightProps {
  children: string;
}

const DateHighlight = ({ children }: DateHighlightProps) => {
  // Try to parse the date from the text
  const dateFormats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'MMM d, yyyy',
    'MMMM d, yyyy'
  ];

  let date = null;
  for (const dateFormat of dateFormats) {
    const parsedDate = parse(children.trim(), dateFormat, new Date());
    if (isValid(parsedDate)) {
      date = parsedDate;
      break;
    }
  }

  if (!date) {
    return <span>{children}</span>;
  }

  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-default"
      title={format(date, 'PPPP')}
    >
      {children}
    </span>
  );
};

export default DateHighlight;