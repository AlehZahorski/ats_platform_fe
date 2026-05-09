export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
}

export interface PipelineStageMutation {
  name: string;
}
