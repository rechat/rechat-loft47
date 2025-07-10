import { supabase } from '../supabase/supabase'

export interface DealData {
  id: number
  deal_id: string
  loft47_id: string
}

export const DealsService = {
  getDeals: async (): Promise<DealData[]> => {
    const { data, error } = await supabase.from('deals').select('*').order('id')

    if (error) {
      throw error
    }

    return data || []
  },
  getDeal: async (dealId: string): Promise<DealData[]> => {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('deal_id', dealId)
      .order('id')

    if (error) {
      throw error
    }

    return data || []
  },
  getDealById: async (id: string): Promise<DealData> => {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return data || []
  },
  createDeal: async (
    deal: Omit<DealData, 'id' | 'created_at'>
  ): Promise<DealData> => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert([deal])
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },
  updateColor: async (
    id: string,
    updates: Partial<DealData>
  ): Promise<DealData> => {
    const { data, error } = await supabase
      .from('deals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },
  deleteColor: async (id: number): Promise<void> => {
    const { error } = await supabase.from('deals').delete().eq('id', id)

    if (error) {
      throw error
    }
  }
}
