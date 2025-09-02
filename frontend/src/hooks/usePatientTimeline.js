import { useState, useEffect } from 'react';
import { notesAPI, documentsAPI, appointmentsAPI } from '../services/api';

const usePatientTimeline = (patientId) => {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar todos os dados do paciente
  const fetchTimelineData = async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    try {
      // Buscar dados em paralelo
      const [notesResponse, documentsResponse, appointmentsResponse] = await Promise.all([
        notesAPI.getByPatient(patientId),
        documentsAPI.getByPatient(patientId),
        appointmentsAPI.getByPatient(patientId)
      ]);

      // Combinar todos os eventos em um array único
      const events = [];

      // Adicionar notas como eventos de consulta
      if (notesResponse.data?.notes) {
        notesResponse.data.notes.forEach(note => {
          events.push({
            id: `note-${note.id}`,
            type: 'consultation',
            title: note.title || 'Consulta Médica',
            description: note.content || 'Sem descrição',
            date: note.created_at,
            doctor: note.author_name || 'Médico não informado',
            notes: note.content,
            originalData: note,
            category: 'note'
          });
        });
      }

      // Adicionar documentos como eventos de exame/documento
      if (documentsResponse.data?.documents) {
        documentsResponse.data.documents.forEach(doc => {
          const isExam = ['exame', 'laudo'].includes(doc.category);
          events.push({
            id: `document-${doc.id}`,
            type: isExam ? 'exam' : 'document',
            title: doc.title || doc.original_name,
            description: `Documento: ${doc.original_name}`,
            date: doc.created_at,
            doctor: doc.uploaded_by_name || 'Sistema',
            notes: doc.extracted_text || 'Documento anexado',
            originalData: doc,
            category: 'document'
          });
        });
      }

      // Adicionar agendamentos como eventos de appointment
      if (appointmentsResponse.data?.appointments) {
        appointmentsResponse.data.appointments.forEach(appointment => {
          events.push({
            id: `appointment-${appointment.id}`,
            type: 'appointment',
            title: `Consulta: ${appointment.title || 'Agendamento'}`,
            description: appointment.description || 'Consulta agendada',
            date: appointment.scheduled_date,
            doctor: appointment.doctor_name || 'Médico não informado',
            notes: appointment.notes || '',
            originalData: appointment,
            category: 'appointment'
          });
        });
      }

      // Ordenar eventos por data (mais recente primeiro)
      events.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTimelineEvents(events);
    } catch (err) {
      console.error('Erro ao buscar dados da timeline:', err);
      setError('Erro ao carregar timeline do paciente');
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar novo evento
  const addTimelineEvent = async (eventData) => {
    try {
      let response;
      
      switch (eventData.category) {
        case 'note':
          response = await notesAPI.create({
            ...eventData,
            patient_id: patientId
          });
          break;
        case 'appointment':
          response = await appointmentsAPI.create({
            ...eventData,
            patient_id: patientId
          });
          break;
        default:
          throw new Error('Tipo de evento não suportado');
      }

      // Recarregar timeline após adicionar
      await fetchTimelineData();
      return response;
    } catch (err) {
      console.error('Erro ao adicionar evento:', err);
      throw err;
    }
  };

  // Função para editar evento
  const editTimelineEvent = async (eventId, eventData) => {
    try {
      const event = timelineEvents.find(e => e.id === eventId);
      if (!event) throw new Error('Evento não encontrado');

      let response;
      const originalId = event.originalData.id;

      switch (event.category) {
        case 'note':
          response = await notesAPI.update(originalId, eventData);
          break;
        case 'appointment':
          response = await appointmentsAPI.update(originalId, eventData);
          break;
        default:
          throw new Error('Tipo de evento não suportado para edição');
      }

      // Recarregar timeline após editar
      await fetchTimelineData();
      return response;
    } catch (err) {
      console.error('Erro ao editar evento:', err);
      throw err;
    }
  };

  // Função para deletar evento
  const deleteTimelineEvent = async (eventId) => {
    try {
      const event = timelineEvents.find(e => e.id === eventId);
      if (!event) throw new Error('Evento não encontrado');

      const originalId = event.originalData.id;

      switch (event.category) {
        case 'note':
          await notesAPI.delete(originalId);
          break;
        case 'appointment':
          await appointmentsAPI.delete(originalId);
          break;
        case 'document':
          await documentsAPI.delete(originalId);
          break;
        default:
          throw new Error('Tipo de evento não suportado para exclusão');
      }

      // Recarregar timeline após deletar
      await fetchTimelineData();
    } catch (err) {
      console.error('Erro ao deletar evento:', err);
      throw err;
    }
  };

  // Carregar dados quando patientId mudar
  useEffect(() => {
    fetchTimelineData();
  }, [patientId]);

  return {
    timelineEvents,
    loading,
    error,
    refreshTimeline: fetchTimelineData,
    addTimelineEvent,
    editTimelineEvent,
    deleteTimelineEvent
  };
};

export default usePatientTimeline;