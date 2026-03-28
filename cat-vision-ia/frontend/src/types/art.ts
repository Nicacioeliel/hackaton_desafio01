export interface Art {
  id: number;
  numero_art: string;
  profissional_nome: string | null;
  contratante_nome: string | null;
  contratante_cnpj: string | null;
  cidade: string | null;
  uf: string | null;
  objeto: string | null;
}

export interface ArtListResponse {
  items: Art[];
  total: number;
}
