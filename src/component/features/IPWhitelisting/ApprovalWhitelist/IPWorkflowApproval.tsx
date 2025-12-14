import React from 'react';
import IPAddRemoveApproval from './IPAddRemoveApproval';

type IPWorkflowApprovalProps = {
  workflowType: string;
};

export default function IPWorkflowApproval({
  workflowType,
}: IPWorkflowApprovalProps) {
  return <IPAddRemoveApproval workflowType={workflowType} />;
}
