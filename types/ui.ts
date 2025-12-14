export type Category = {
  id: string;
  label: string;
  icon: string;
  color: string;
  children?: Category[];
  parentId?: string;
};
