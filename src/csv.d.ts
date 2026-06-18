// Importing a .csv file (with the text loader) yields its raw contents.
declare module "*.csv" {
  const content: string;
  export default content;
}
