const { Router } = require('express') // 
const Aluno = require('../models/Aluno')
const Curso = require('../models/Curso')
const Professor = require('../models/Professor')
const { sign } = require('jsonwebtoken')
const { auth } = require('../middleware/auth')
const routes = new Router()

routes.get('/bem_vindo', (req, res) => {
res.json({name: 'Bem vindo'})
})

/* =====> Rotas de Login <===== */
routes.post('/login', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        if (!email) {
            return res.status(400).json({ messagem: 'O email é obrigatório' })
        }

        if (!password) {
            return res.status(400).json({ messagem: 'O password é obrigatório' })
        }

        const aluno = await Aluno.findOne({
            where: {email:email, password:password}
        })

        if(!aluno){
            return res.status(404).json({ messagem: 'Nenhum aluno corresponde a email e senha fornecidos!' })
        }
        console.log(aluno)

        const payload = { sub: aluno.id, email: aluno.email, nome: aluno.nome }

        if (!process.env.SECRET_JWT) {
            console.error('A chave secreta JWT não está definida!')
            return res.status(500).json({ messagem: 'Erro interno no servidor!' })
        }

        const token = sign(payload, process.env.SECRET_JWT)
        console.log(token)

        res.status(200).json({Token: token})

    } catch (error) {
        console.error('Erro ao tentar fazer login: ', error)
        return res.status(500).json({ error: error, messagem: 'Algo deu errado!' })
    }
})

/* =====> Rotas Alunos <===== */
routes.post('/alunos', async (req, res) => {

    try {
    const email = req.body.email
    const password = req.body.password
    const nome = req.body.nome
    const data_nascimento = req.body.data_nascimento
    const celular = req.body.celular

    if (!nome) {
        return res.status(400).json({message: 'O nome é obrigatório'})

    }

    if (!data_nascimento) {
        return res.status(400).json({message: 'A data de nascimento é obrigatória'})
    }

    if(!data_nascimento.match(/\d{4}-\d{2}-\d{2}/gm)) {
        return res.status(400).json({ messagem: 'A data de nascimento é não está no formato correto' }) 
    }

        const aluno = await Aluno.create({
        email: email,
        password: password,
        nome: nome,
        data_nascimento: data_nascimento,
        celular: celular
    })  
res.status(201).json(aluno)
} catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Não foi possível cadastrar o aluno.' })
    console.log(error.message)
    }
    
})

/* rota para alterar a senha
routes.get('/alunos/alterar_senha', auth, async (req, res) => {
    id = req.payload.sub
    }) */
    
// Utiliza o auth nas rotas privadas
routes.get('/alunos', auth, async (req, res) => {
const alunos = await Aluno.findAll()
res.json(alunos) //res.json(req.payload) lista apenas o id do token
})

routes.get('/alunos/:id', auth, async (req, res) => {
    try {

        const { id } = req.params

        const aluno = await Aluno.findByPk(id)

        if (!aluno) {
            return res.status(404).json({ message: "Usuário não encontrado!"})
        }

        res.json(aluno)

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Não foi possível listar o aluno específico", error: error})
    }
})

routes.put('/alunos/:id', async (req, res) => {
    const id = req.params.id

    const { email, password, nome, data_nascimento, celular } = req.body
    const aluno = await Aluno.findByPk(id)

    if (!aluno) {
        return res.status(400).json({message: 'Aluno não encontrado'})
    }
    aluno.update(req.body)
    await aluno.save()

    res.json(aluno)
})

routes.patch('/alunos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const aluno = await Aluno.findByPk(id);
        if (!aluno) {
            return res.status(404).json({ message: 'Aluno não encontrado' })
        }
        const camposPermitidos = ['nome', 'email', 'password', 'data_nascimento', 'celular']
        const camposParaAtualizar = Object.keys(req.body)
        const camposValidos = camposParaAtualizar.every(campo => camposPermitidos.includes(campo))

        if (!camposValidos) {
            return res.status(400).json({ message: 'Campos inválidos para atualização' })
        }
        const dadosParaAtualizar = {}
        camposParaAtualizar.forEach(campo => {
            if (camposPermitidos.includes(campo)) {
                dadosParaAtualizar[campo] = req.body[campo]
            }
        })

        const resultado = await aluno.update(dadosParaAtualizar)
        res.status(200).json(resultado)
    } catch (error) {
        console.log.error('Erro ao atualizar o aluno: ', error)
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
})

routes.delete('/alunos/:id', async (req, res) => {
    const id = req.params.idAlunos.destroy({
        where: {
            id: id
        }
    })
    res.json({ message: 'Aluno deletado com sucesso!' })
})

/* =====> Rotas Cursos <===== */
routes.post('/cursos', async (req, res) => {
try {
    const nome = req.body.nome
    const duracao_horas = req.body.duracao_horas

    if (!nome) {
        return res.status(400).json({
            message: 'O nome é obrigatório'
        })
    } 

    if (!(duracao_horas >= 40 && duracao_horas <= 2000)) {
        return res.status(400).json({
            message: 'A duração do curso deve ser entre 40 e 2000 horas'
        })
    }
    const cursos = await Curso.create({
        nome: nome,
        duracao_horas: duracao_horas
    })
    res.status(201).json(cursos)
} catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Não foi possível cadastrar o curso.' })

}
})

routes.get('/cursos', async (req, res) => {
const nome = req.query.nome || ''
if (nome) {
    const cursos = await Curso.findAll({
        where: {
            nome: nome
        }
    })
    return res.json(cursos)
}
const cursos = await Curso.findAll()
res.json(cursos)
}) 

routes.delete('/cursos/:id', (req, res) => {
const id = req.params.id
Curso.destroy({
    where: {
        id: id
    }
})


res.json({ message: 'Curso deletado com sucesso' })
})

routes.put('/cursos/:id', async (req, res) => {
const id = req.params.id

const curso = await Curso.findByPk(id)

if(!curso) {
    return res.status(404).json({mensagem: 'Curso não encontraddo'})
}
curso.update(req.body)

await curso.save()

res.json(curso)
})

/* =====> Rotas Professores <===== */

routes.post('/professores', async (req, res) => {
    try {
        const nome = req.body.nome
        const data_admissao = req.body.data_admissao
        const carga_horaria = req.body.carga_horaria

        if (!nome) {
            return res.status(401).json({ message: 'O nome é obrigatório' })
        }
        if (!data_admissao || !/\d{4}-\d{2}-\d{2}/.test(data_admissao)) {
            return res.status(400).json({
                message: 'A data de admissão não está no formato correto'
            })
        }
        if (!carga_horaria) {
            return res.status(400).json({ message: 'A carga horária é obrigatória' })
        }
        const professor = await Professor.create({
            nome: nome,
            data_admissao: data_admissao,
            carga_horaria: carga_horaria
        })

        res.status(201).json(professor)

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Não foi possível cadastrar o professor' })

    }    
})

routes.get('/professores', async (req, res) => {
    const professores = await Professor.findAll()
    res.json(professores)
})

routes.get('/professores/:id', async (req, res) => {
    try {
        const { id } = req.params
        const professor = await Professor.findByPk(id)

        if (!professor) {
            return res.status(404).json({ message: "Professor não encontrado!" })
        }

        res.json(professor)

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Não foi possível listar o professor específico", error: error })
    }
})

routes.put('/professores/:id', async (req, res) => {
    const id = req.params.id
    const { nome, data_admissao, carga_horaria } = req.body
    const professor = await Professor.findByPk(id)

    if (!professor) {
        return res.status(404).json({message: 'Professor não encontrado'})
    }
    professor.update(req.body)
    await professor.save()

    res.json(professor)
})
    
routes.delete('/professores/:id', (req, res) => {
    const id = req.params.id
    Professor.destroy({
        where: {
            id: id
        }
    })

    res.json({ message: 'Professor deletado com sucesso!'})
})



module.exports = routes

