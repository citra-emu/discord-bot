export interface IGameDBEntry {
    directory: string;
    title: string;
    compatibility: number;
}

export interface ICompatList {
    [key: number]: {
        key: string,
        name: string,
        color: string,
        description: string
    }
}
