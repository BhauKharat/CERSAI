import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector';
import { styled } from '@mui/material/styles';

const CustomStepConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 12,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#52AE32',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#52AE32',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#D3D3D3',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

export default CustomStepConnector;
