import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface KPIData {
  dimension: string;
  subdimension: string;
  indicator: string;
  status: string;
  description: string;
  formula: string;
  data: string;
  source: string;
  importance: string;
  frequency: string;
  sourceDetail: string;
}

interface IndicatorData {
  dimension: string;
  subdimension: string;
  indicator: string;
  okko: string;
  description: string;
  formula: string;
  data: string;
  origin: string;
  importance: string;
  periodicity: string;
  source: string;
}

export const useChatService = () => {
  const [kpisCache, setKpisCache] = useState<KPIData[] | null>(null);
  const [indicatorsCache, setIndicatorsCache] = useState<IndicatorData[] | null>(null);

  const loadKPIs = useCallback(async (): Promise<KPIData[]> => {
    if (kpisCache) return kpisCache;

    try {
      const response = await fetch('/data/kpis-completo.csv');
      const text = await response.text();
      const lines = text.split('\n');
      const parsedKPIs: KPIData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(';');
        if (values.length >= 13) {
          parsedKPIs.push({
            dimension: values[0]?.trim() || '',
            subdimension: values[1]?.trim() || '',
            indicator: values[2]?.trim() || '',
            status: values[3]?.trim() || '',
            description: values[5]?.trim() || '',
            formula: values[6]?.trim() || '',
            data: values[7]?.trim() || '',
            source: values[8]?.trim() || '',
            importance: values[9]?.trim() || '',
            frequency: values[10]?.trim() || '',
            sourceDetail: values[11]?.trim() || '',
          });
        }
      }

      setKpisCache(parsedKPIs);
      return parsedKPIs;
    } catch (error) {
      console.error('Error loading KPIs:', error);
      return [];
    }
  }, [kpisCache]);

  const loadIndicators = useCallback(async (): Promise<IndicatorData[]> => {
    if (indicatorsCache) return indicatorsCache;

    try {
      const response = await fetch('/data/indicadores-kpis.csv');
      const text = await response.text();
      const lines = text.split('\n');
      const data: IndicatorData[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(';');
          if (values.length >= 13) {
            data.push({
              dimension: values[0] || '',
              subdimension: values[1] || '',
              indicator: values[2] || '',
              okko: values[3] || '',
              description: values[5] || '',
              formula: values[6] || '',
              data: values[7] || '',
              origin: values[8] || '',
              importance: values[9] || '',
              periodicity: values[10] || '',
              source: values[11] || '',
            });
          }
        }
      }

      setIndicatorsCache(data);
      return data;
    } catch (error) {
      console.error('Error loading indicators:', error);
      return [];
    }
  }, [indicatorsCache]);

  const searchInKPIs = useCallback(async (query: string): Promise<string> => {
    const kpis = await loadKPIs();
    const queryLower = query.toLowerCase();

    // Buscar por dimensión
    const dimensionMatches = kpis.filter(
      (kpi) =>
        kpi.dimension.toLowerCase().includes(queryLower) ||
        kpi.dimension.toLowerCase().includes(queryLower.replace(/emprendimiento|innovación|innovacion/, 'emprendimiento'))
    );

    // Buscar por indicador
    const indicatorMatches = kpis.filter(
      (kpi) =>
        kpi.indicator.toLowerCase().includes(queryLower) ||
        kpi.description.toLowerCase().includes(queryLower)
    );

    // Buscar por subdimensión
    const subdimensionMatches = kpis.filter((kpi) =>
      kpi.subdimension.toLowerCase().includes(queryLower)
    );

    const allMatches = [...new Set([...dimensionMatches, ...indicatorMatches, ...subdimensionMatches])];

    if (allMatches.length === 0) {
      return "No encontré información específica sobre tu consulta en los datos de KPIs. ¿Puedes reformular tu pregunta o ser más específico?";
    }

    if (allMatches.length === 1) {
      const kpi = allMatches[0];
      return `Encontré información sobre "${kpi.indicator}":\n\n` +
        `📊 **Indicador**: ${kpi.indicator}\n` +
        `📋 **Dimensión**: ${kpi.dimension}\n` +
        `🔹 **Subdimensión**: ${kpi.subdimension || 'N/A'}\n` +
        `📝 **Descripción**: ${kpi.description || 'No disponible'}\n` +
        `🧮 **Fórmula**: ${kpi.formula || 'No disponible'}\n` +
        `📈 **Importancia**: ${kpi.importance || 'N/A'}\n` +
        `🔄 **Frecuencia**: ${kpi.frequency || 'N/A'}\n` +
        `📚 **Fuente**: ${kpi.source || 'N/A'}`;
    }

    // Múltiples resultados
    let response = `Encontré ${allMatches.length} indicadores relacionados con tu consulta:\n\n`;
    const topMatches = allMatches.slice(0, 5);
    topMatches.forEach((kpi, idx) => {
      response += `${idx + 1}. **${kpi.indicator}**\n`;
      response += `   - Dimensión: ${kpi.dimension}\n`;
      response += `   - ${kpi.description ? kpi.description.substring(0, 100) + '...' : 'Sin descripción'}\n\n`;
    });

    if (allMatches.length > 5) {
      response += `\n... y ${allMatches.length - 5} indicadores más. ¿Te gustaría información más detallada sobre alguno en particular?`;
    }

    return response;
  }, [loadKPIs]);

  const searchInIndicators = useCallback(async (query: string): Promise<string> => {
    const indicators = await loadIndicators();
    const queryLower = query.toLowerCase();

    const matches = indicators.filter(
      (ind) =>
        ind.indicator.toLowerCase().includes(queryLower) ||
        ind.description.toLowerCase().includes(queryLower) ||
        ind.dimension.toLowerCase().includes(queryLower) ||
        ind.subdimension.toLowerCase().includes(queryLower)
    );

    if (matches.length === 0) {
      return "No encontré indicadores específicos relacionados con tu consulta. Intenta reformular tu pregunta.";
    }

    if (matches.length === 1) {
      const ind = matches[0];
      return `**Indicador encontrado**: ${ind.indicator}\n\n` +
        `📊 **Dimensión**: ${ind.dimension}\n` +
        `📝 **Descripción**: ${ind.description || 'No disponible'}\n` +
        `🧮 **Fórmula**: ${ind.formula || 'No disponible'}\n` +
        `📈 **Importancia**: ${ind.importance || 'N/A'}\n` +
        `🔄 **Periodicidad**: ${ind.periodicity || 'N/A'}\n` +
        `📚 **Origen**: ${ind.origin || 'N/A'}`;
    }

    let response = `Encontré ${matches.length} indicadores:\n\n`;
    matches.slice(0, 5).forEach((ind, idx) => {
      response += `${idx + 1}. ${ind.indicator} (${ind.dimension})\n`;
    });

    return response;
  }, [loadIndicators]);

  const getStatistics = useCallback(async (): Promise<string> => {
    const kpis = await loadKPIs();
    const indicators = await loadIndicators();

    // Obtener estadísticas de encuestas desde Supabase
    let surveysCount = 0;
    let responsesCount = 0;
    try {
      const { data: surveys } = await supabase.from('surveys').select('id', { count: 'exact' });
      surveysCount = surveys?.length || 0;
      
      const { data: responses } = await supabase.from('survey_responses').select('id', { count: 'exact' });
      responsesCount = responses?.length || 0;
    } catch (error) {
      console.error('Error fetching survey statistics:', error);
    }

    const dimensions = new Set(kpis.map((k) => k.dimension));
    const activeKPIs = kpis.filter((k) => k.status === 'OK').length;

    return `📊 **Estadísticas del Ecosistema Valenciano**:\n\n` +
      `**KPIs e Indicadores**:\n` +
      `• Total de KPIs: ${kpis.length}\n` +
      `• KPIs activos: ${activeKPIs}\n` +
      `• Total de indicadores: ${indicators.length}\n` +
      `• Dimensiones cubiertas: ${dimensions.size}\n\n` +
      `**Encuestas y Reportes**:\n` +
      `• Encuestas disponibles: ${surveysCount}\n` +
      `• Respuestas recibidas: ${responsesCount}\n\n` +
      `**Dimensiones principales**:\n` +
      Array.from(dimensions).slice(0, 5).map((d, i) => `${i + 1}. ${d}`).join('\n');
  }, [loadKPIs, loadIndicators]);

  const getSurveysInfo = useCallback(async (): Promise<string> => {
    try {
      const { data: surveys, error } = await supabase
        .from('surveys')
        .select('id, title, description, active, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!surveys || surveys.length === 0) {
        return "No hay encuestas activas disponibles en este momento.";
      }

      let response = `📋 **Encuestas Disponibles**:\n\n`;
      surveys.forEach((survey, idx) => {
        response += `${idx + 1}. **${survey.title}**\n`;
        if (survey.description) {
          response += `   ${survey.description.substring(0, 100)}${survey.description.length > 100 ? '...' : ''}\n`;
        }
        response += `   Creada: ${new Date(survey.created_at).toLocaleDateString('es-ES')}\n\n`;
      });

      if (surveys.length === 5) {
        response += `\n... y posiblemente más encuestas disponibles.`;
      }

      return response;
    } catch (error) {
      console.error('Error fetching surveys:', error);
      return "Hubo un error al obtener la información de encuestas. Por favor, intenta de nuevo.";
    }
  }, []);

  const processQuestion = useCallback(async (question: string): Promise<string> => {
    const questionLower = question.toLowerCase();

    // Preguntas sobre encuestas
    if (
      questionLower.includes('encuesta') ||
      questionLower.includes('survey') ||
      questionLower.includes('formulario') ||
      questionLower.includes('cuestionario')
    ) {
      return await getSurveysInfo();
    }

    // Preguntas de estadísticas generales
    if (
      questionLower.includes('cuántos') ||
      questionLower.includes('cuantos') ||
      questionLower.includes('estadísticas') ||
      questionLower.includes('estadisticas') ||
      questionLower.includes('total') ||
      questionLower.includes('resumen')
    ) {
      return await getStatistics();
    }

    // Buscar en KPIs
    if (
      questionLower.includes('kpi') ||
      questionLower.includes('indicador') ||
      questionLower.includes('métrica') ||
      questionLower.includes('metrica') ||
      questionLower.includes('dimensión') ||
      questionLower.includes('dimension')
    ) {
      return await searchInKPIs(question);
    }

    // Buscar en indicadores
    if (
      questionLower.includes('indicador') ||
      questionLower.includes('medición') ||
      questionLower.includes('medicion') ||
      questionLower.includes('datos abiertos')
    ) {
      return await searchInIndicators(question);
    }

    // Búsqueda general
    const kpiResult = await searchInKPIs(question);
    if (kpiResult && !kpiResult.includes('No encontré')) {
      return kpiResult;
    }

    const indicatorResult = await searchInIndicators(question);
    if (indicatorResult && !indicatorResult.includes('No encontré')) {
      return indicatorResult;
    }

    // Respuesta por defecto
    return `He buscado en los datos disponibles pero no encontré información específica sobre "${question}".\n\n` +
      `Puedo ayudarte con:\n` +
      `• Preguntas sobre KPIs y métricas\n` +
      `• Información sobre dimensiones del ecosistema\n` +
      `• Estadísticas generales\n` +
      `• Datos abiertos y reportes\n` +
      `• Información sobre encuestas disponibles\n\n` +
      `¿Puedes reformular tu pregunta de manera más específica?`;
  }, [searchInKPIs, searchInIndicators, getStatistics, getSurveysInfo]);

  return {
    processQuestion,
    loadKPIs,
    loadIndicators,
  };
};

