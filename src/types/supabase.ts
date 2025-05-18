export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analysis_results: {
        Row: {
          id: number
          user_id: string
          time: number
          result: Json
          created_at: string
        }
        Insert: {
          id?: never // using identity
          user_id: string
          time: number
          result: Json
          created_at?: string
        }
        Update: {
          id?: never
          user_id?: string
          time?: number
          result?: Json
          created_at?: string
        }
      }
    }
    Functions: {
      get_latest_analysis: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
  }
}
