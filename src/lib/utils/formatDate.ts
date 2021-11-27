import dayjs from 'dayjs';

export const formatDate = (date: Date, short = false) =>
	dayjs(date).format(short ? 'DD/MM/YYYY' : 'DD/MM/YYYY [a las] hh:mm a');
