import { useCallback, useEffect, useState } from 'react'
import { getUserEmail, linkUserEmail, postUserEmail } from '../api/user'
import { ApiRespCode } from '../api';

export enum EmailStatus {
  NOT_VERIFIED,
  VERIFIED,
  VERIFYING,
}
const COUNT_DOWN = 60
export default function useUserAccount(didSession: string | undefined) {
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState(EmailStatus.NOT_VERIFIED)
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)

  const [sendEmailCountDown, setSendEmailCountDown] = useState(0)

  useEffect(() => {
    if (sendEmailCountDown > 0) {
      setTimeout(() => {
        setSendEmailCountDown(sendEmailCountDown - 1)
      }, 1000)
    }
  }, [sendEmailCountDown])

  const getEmail = useCallback(async () => {
    if (!didSession) return
    setErrorMsg('')
    const resp = await getUserEmail(didSession)
    if (resp.data?.code === ApiRespCode.SUCCESS && resp.data?.data?.email) {
      setEmail(resp.data.data.email)
      setEmailStatus(EmailStatus.VERIFIED)
    }
    if (resp?.data?.code === ApiRespCode.ERROR) {
      setErrorMsg(resp?.data?.msg)
    }
  }, [didSession])

  const sendEmail = useCallback(async (email: string) => {
    if (!didSession) return
    setErrorMsg('')
    const resp = await postUserEmail(didSession, email)
    if (resp.data?.code === ApiRespCode.SUCCESS) {
      setEmailStatus(EmailStatus.VERIFYING)
      setSendEmailCountDown(COUNT_DOWN)
    }
    if (resp?.data?.code === ApiRespCode.ERROR) {
      setErrorMsg(resp?.data?.msg)
    }
    return resp;
  }, [didSession])

  const verifyEmail = useCallback(async (email: string, code: string) => {
    if (!didSession) return
    setErrorMsg('')
    const resp = await linkUserEmail(didSession, email, code)
    if (resp.data?.code === ApiRespCode.SUCCESS) {
      getEmail()
    } else if (resp?.data?.code === ApiRespCode.ERROR) {
      setErrorMsg(resp?.data?.msg)
    }
  }, [didSession, getEmail])

  useEffect(() => {
    if (didSession) getEmail();
  }, [didSession, getEmail])

  return {
    email,
    emailStatus,
    errorMsg,
    sendEmailCountDown,
    setEmailStatus,
    sendEmail,
    verifyEmail,
  }
}
