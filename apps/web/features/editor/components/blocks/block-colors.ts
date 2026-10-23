export interface BlockColorProps {
  color?: string | undefined;
  backgroundColor?: string | undefined;
}

export const getBlockColorClasses = (props: Record<string, unknown> | undefined): string => {
  if (!props) return "";

  const color = typeof props["color"] === "string" ? props["color"] : undefined;
  const backgroundColor =
    typeof props["backgroundColor"] === "string" ? props["backgroundColor"] : undefined;

  const classes: string[] = [];

  if (color) {
    switch (color) {
      case "gray":
        classes.push("text-gray-500");
        break;
      case "brown":
        classes.push("text-amber-800");
        break;
      case "orange":
        classes.push("text-orange-600");
        break;
      case "yellow":
        classes.push("text-yellow-600");
        break;
      case "green":
        classes.push("text-emerald-600");
        break;
      case "blue":
        classes.push("text-blue-600");
        break;
      case "purple":
        classes.push("text-purple-600");
        break;
      case "pink":
        classes.push("text-pink-600");
        break;
      case "red":
        classes.push("text-red-600");
        break;
    }
  }

  if (backgroundColor) {
    switch (backgroundColor) {
      case "gray":
        classes.push("bg-gray-100/90 px-1.5 py-0.5 rounded");
        break;
      case "brown":
        classes.push("bg-amber-100/70 px-1.5 py-0.5 rounded");
        break;
      case "orange":
        classes.push("bg-orange-100/70 px-1.5 py-0.5 rounded");
        break;
      case "yellow":
        classes.push("bg-yellow-100 px-1.5 py-0.5 rounded");
        break;
      case "green":
        classes.push("bg-emerald-100/70 px-1.5 py-0.5 rounded");
        break;
      case "blue":
        classes.push("bg-blue-100/70 px-1.5 py-0.5 rounded");
        break;
      case "purple":
        classes.push("bg-purple-100/70 px-1.5 py-0.5 rounded");
        break;
      case "pink":
        classes.push("bg-pink-100/70 px-1.5 py-0.5 rounded");
        break;
      case "red":
        classes.push("bg-red-100/70 px-1.5 py-0.5 rounded");
        break;
    }
  }

  return classes.join(" ");
};
