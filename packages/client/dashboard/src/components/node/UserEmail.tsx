import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import useUserAccount, { EmailStatus } from '../../hooks/useUserAccount'

export default function Email ({
  emailStatusChange
}: {
  emailStatusChange: (stutas: EmailStatus) => void
}) {
  const session = useSession()
  const {
    email,
    emailStatus,
    setEmailStatus,
    errorMsg,
    sendEmail,
    sendEmailCountDown,
    verifyEmail
  } = useUserAccount(session?.serialize())
  const [newEmail, setNewEmail] = useState(email)
  const [code, setCode] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const [verifyingEmail, setVerifyingEmail] = useState(false)
  useEffect(() => {
    emailStatusChange(emailStatus)
  }, [emailStatus, emailStatusChange])

  const send = async () => {
    setSendingEmail(true)
    await sendEmail(newEmail)
    setSendingEmail(false)
  }

  switch (emailStatus) {
    case EmailStatus.VERIFIED:
      return (
        <Box>
          <span>* Email:</span>
          <div>
            <input type='text' value={email} disabled />
            <button
              className='submit'
              onClick={() => setEmailStatus(EmailStatus.NOT_VERIFIED)}
            >
              Change Email
            </button>
          </div>
        </Box>
      )
    case EmailStatus.NOT_VERIFIED:
      return (
        <Box>
          <span>* Email:</span>
          <div>
            <input
              type='text'
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
            />
            <button
              className='submit'
              disabled={sendingEmail || sendEmailCountDown > 0 || newEmail===''}
              onClick={send}
            >
              {sendEmailCountDown
                ? `Send in (${sendEmailCountDown})s`
                : `Send Email`}
            </button>
          </div>
          <p>{errorMsg}</p>
        </Box>
      )
    case EmailStatus.VERIFYING:
      return (
        <Box>
          <span>* Email:</span>
          <div>
            <input
              type='text'
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
            />
            <button
              className='submit'
              disabled={sendingEmail || sendEmailCountDown > 0}
              onClick={send}
            >
              {sendEmailCountDown
                ? `Send Email (${sendEmailCountDown})`
                : `Send Email`}
            </button>
          </div>
          <div>
            <input
              type='text'
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <button
              className='submit'
              disabled={sendingEmail || verifyingEmail}
              onClick={() => {
                setVerifyingEmail(true)
                verifyEmail(newEmail, code)
                setVerifyingEmail(false)
              }}
            >
              Verify Email
            </button>
          </div>
          <p>{errorMsg}</p>
        </Box>
      )
  }
}
const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  div {
    /* height: calc(100v - 88px); */
    box-sizing: border-box;
    display: flex;
    gap: 20px;
  }

  input {
    width: auto;
    background: #1a1e23;
    outline: none;
    border: 1px solid #39424c;
    border-radius: 12px;
    height: 48px;
    padding: 0px 16px;
    color: #ffffff;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    flex: 1 1 auto;
  }

  button {
    background: #1a1e23;
    border: 1px solid #39424c;
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #718096;
    width: 160px;
    flex: 0 0 150px;
    &.submit {
      color: #14171a;
      background: #ffffff;
    }

    > img {
      height: 18px;
    }
  }
`
