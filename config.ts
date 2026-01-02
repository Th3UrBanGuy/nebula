
// Config Interface
interface Config {
  // Prototype mode doesn't need external config, but we keep the structure for future scalability
  APP_MODE: string;
}

export const CONFIG: Config = {
  APP_MODE: 'Produ',
};
