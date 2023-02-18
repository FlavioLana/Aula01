import { Component, Inject, OnInit } from '@angular/core';
import { FormControl} from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CategoriasService } from 'src/app/services/categorias.service';
import { map, startWith } from 'rxjs/operators';
import {MatAutocompleteModule} from '@angular/material/autocomplete';


@Component({
  selector: 'app-listagem-categorias',
  templateUrl: './listagem-categorias.component.html',
  styleUrls: ['./listagem-categorias.component.css']
})
export class ListagemCategoriasComponent implements OnInit {

  constructor(private categoriasService: CategoriasService,
              private dialogExclusao: MatDialog) { }

  categorias = new MatTableDataSource<any>()
  displayedColumns!: string[]
  autoCompleteInput = new FormControl();
  opcoesCategorias: string[] = []
  nomesCategorias!: Observable<string[]> 
  xx!:string


  ngOnInit(): void {
    this.categoriasService.PegarTodos().subscribe(resultado => {
      resultado.forEach(categoria=>{
        this.opcoesCategorias.push(categoria.nome)
      })
      this.categorias.data = resultado
    })
    this.displayedColumns = this.ExibirColunas()


    if (this.autoCompleteInput.value !== null) {
      this.nomesCategorias = this.autoCompleteInput.valueChanges.          
                            pipe(startWith(''),
                            map(nome=>this.FiltrarNomes(nome[0])))
    }                          

  }


  private FiltrarNomes(nome: string): string[] {

    if ((nome !== null) && (nome.trim.length>=4)) {
      this.categoriasService.FiltrarCategorias(nome.toLowerCase()).subscribe(resultado=>{
        this.categorias.data = resultado
      })
    }
    else {
      if (nome==='') {
        this.categoriasService.PegarTodos().subscribe(resultado=>{
          this.categorias.data = resultado
        })
      }
    }

    return this.opcoesCategorias.filter(categoria=>{
      categoria.toLowerCase().includes(nome.toLowerCase())
    })
  }

  
  AbrirDialogExclusao(categoriaID: number, nome: string): void {

    this.dialogExclusao.open(DialogExclusaoCategoriasComponent, {
      data: {
        categoriaID: categoriaID,
        nome: nome
      }
    }).afterClosed().subscribe(resultado => {
      if (resultado===true) {
        this.categoriasService.PegarTodos().subscribe((dados)  => {
          this.categorias.data = dados
        })
        this.displayedColumns = this.ExibirColunas()
      }
    })
  }
  
  ExibirColunas(): string[] {
    return ['nome', 'icone', 'tipo', 'acoes']
  }


}


// Componente do Dialog de Exclusão:

@Component({
  selector: 'app-dialog-exclusao-categorias',
  templateUrl: 'dialog-exclusao-categorias.html'
})
export class DialogExclusaoCategoriasComponent {
  constructor (@Inject (MAT_DIALOG_DATA) public dados: any,
      private categoriasService: CategoriasService) { }
    
  ExcluirCategoria(categoriaID: number): void {
    
    this.categoriasService.ExcluiCategoria(categoriaID).subscribe(resultado=>{

    })
  }
}



